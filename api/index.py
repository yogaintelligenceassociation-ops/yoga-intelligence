"""
Yoga Intelligence API — Vercel Python serverless entry point.

Exposes the FastAPI ASGI app as `app` (auto-detected by @vercel/python).
All endpoints live under /api/* so the same routing works locally and on Vercel.
"""

from __future__ import annotations

import os
import re
import secrets
import time
import uuid
from datetime import datetime, timedelta, timezone
from html import escape as html_escape
from typing import Optional

import google.generativeai as genai
import httpx
import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field, field_validator
from pymongo import ASCENDING, MongoClient

load_dotenv()

# ─── Config ─────────────────────────────────────────────────────────────────
MONGO_URL = os.environ.get("MONGO_URL", "").strip()
DB_NAME = os.environ.get("DB_NAME", "yoga_intelligence")
FAST2SMS_API_KEY = os.environ.get("FAST2SMS_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
# Optional: Google Apps Script Web App URL that appends {name, phone} to a Sheet.
GOOGLE_SHEET_WEBHOOK_URL = os.environ.get("GOOGLE_SHEET_WEBHOOK_URL", "").strip()
JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "").strip()
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
IS_PRODUCTION = os.environ.get("VERCEL_ENV", os.environ.get("NODE_ENV", "development")).lower() in {
    "production",
    "preview",
}

JWT_ALGO = "HS256"
# Long-lived session: once a phone verifies OTP, it stays logged in for a year.
# The token is stored in the browser's localStorage, so re-opening the site on
# the same device keeps the user signed in without re-entering an OTP.
JWT_EXPIRE_HOURS = 24 * 365
OTP_EXPIRE_MINS = 5
LLM_MODEL = "gemini-2.5-flash"

# Fail loudly when running in production without a real secret — defaults are unsafe.
if IS_PRODUCTION and not JWT_SECRET:
    raise RuntimeError("JWT_SECRET_KEY must be set in production")
if not JWT_SECRET:
    JWT_SECRET = "dev-only-insecure-secret-do-not-use-in-production"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ─── App ────────────────────────────────────────────────────────────────────
app = FastAPI(title="Yoga Intelligence API", version="3.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=False if CORS_ORIGINS == ["*"] else True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    return response


# ─── Database (lazy, single client per warm invocation) ─────────────────────
_mongo_client: Optional[MongoClient] = None


def get_db():
    global _mongo_client
    if not MONGO_URL:
        raise HTTPException(status_code=503, detail="Database not configured")
    if _mongo_client is None:
        # Serverless-friendly pooling: each warm Lambda keeps a small bounded pool
        # and reuses it across invocations, so many concurrent users don't exhaust
        # Atlas connections. Idle connections are reaped quickly.
        _mongo_client = MongoClient(
            MONGO_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=0,
            maxIdleTimeMS=30000,
            retryWrites=True,
        )
        try:
            db = _mongo_client[DB_NAME]
            # OTPs auto-expire (TTL); users indexed for fast lookups at scale.
            # (Chats are ephemeral and never stored, so there is no chat index.)
            db["otps"].create_index([("created_at", ASCENDING)], expireAfterSeconds=(OTP_EXPIRE_MINS + 1) * 60)
            db["otps"].create_index([("phone", ASCENDING)])
            db["users"].create_index([("phone", ASCENDING)], unique=True)
        except Exception:
            pass
    return _mongo_client[DB_NAME]


# ─── Auth helpers ───────────────────────────────────────────────────────────
bearer = HTTPBearer(auto_error=False)


def make_jwt(phone: str) -> str:
    payload = {
        "sub": phone,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=401, detail="Authentication required")
    return verify_jwt(creds.credentials)


def normalize_phone(raw: str) -> str:
    return re.sub(r"\D", "", raw or "")[-10:]


def is_valid_phone(phone: str) -> bool:
    return bool(re.fullmatch(r"\d{10}", phone))


def sanitize_text(text: str, max_len: int = 4000) -> str:
    cleaned = html_escape(text or "", quote=False)
    return cleaned[:max_len].strip()


def sanitize_name(raw: str) -> str:
    """Keep names safe for storage and for a spreadsheet cell.

    Strips control chars and any leading =,+,-,@ (CSV/formula-injection guard),
    collapses whitespace, and caps length.
    """
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", raw or "")  # control chars
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = cleaned.lstrip("=+-@\t\r")  # neutralise spreadsheet formula triggers
    # Allow letters (incl. unicode), spaces, and a few common name punctuation marks.
    cleaned = re.sub(r"[^\w\s.\-']", "", cleaned, flags=re.UNICODE)
    return cleaned[:60].strip()


# ─── Rate limiting (in-memory; per warm instance) ───────────────────────────
_rate_buckets: dict[str, list[float]] = {}


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    now = time.time()
    bucket = _rate_buckets.setdefault(key, [])
    cutoff = now - window_seconds
    bucket[:] = [ts for ts in bucket if ts > cutoff]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")
    bucket.append(now)


# ─── Fast2SMS ───────────────────────────────────────────────────────────────
async def send_sms_fast2sms(phone: str, otp: str) -> dict:
    if not FAST2SMS_API_KEY:
        return {"sent": False, "reason": "SMS provider not configured"}

    message = (
        f"Your Yoga Intelligence OTP is: {otp}. "
        f"Valid for {OTP_EXPIRE_MINS} minutes. Do not share it. "
        f"- Yogacharya Mrityunjay Pandey"
    )

    headers = {"authorization": FAST2SMS_API_KEY, "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://www.fast2sms.com/dev/bulkV2",
                headers=headers,
                json={"variables_values": otp, "route": "otp", "numbers": phone},
            )
            if r.json().get("return") is True:
                return {"sent": True, "route": "otp"}
    except Exception:
        pass

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://www.fast2sms.com/dev/bulkV2",
                headers=headers,
                json={
                    "route": "q",
                    "message": message,
                    "language": "english",
                    "flash": 0,
                    "numbers": phone,
                },
            )
            data = r.json()
            if data.get("return") is True:
                return {"sent": True, "route": "quick"}
            return {"sent": False, "reason": data.get("message", "SMS provider error")}
    except Exception as exc:
        return {"sent": False, "reason": "SMS provider unreachable"}


# ─── Google Sheet logging (best-effort, never blocks login) ─────────────────
async def log_to_sheet(name: str, phone: str) -> None:
    if not GOOGLE_SHEET_WEBHOOK_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            await client.post(
                GOOGLE_SHEET_WEBHOOK_URL,
                json={"name": name, "phone": phone},
            )
    except Exception:
        # Logging to the sheet must never break authentication.
        pass


# ─── Models ─────────────────────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

    @field_validator("phone")
    @classmethod
    def _valid_phone(cls, v: str) -> str:
        cleaned = normalize_phone(v)
        if not is_valid_phone(cleaned):
            raise ValueError("Invalid phone — must be a 10-digit Indian mobile number")
        return cleaned


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)
    name: str = Field("", max_length=80)

    @field_validator("phone")
    @classmethod
    def _valid_phone(cls, v: str) -> str:
        cleaned = normalize_phone(v)
        if not is_valid_phone(cleaned):
            raise ValueError("Invalid phone")
        return cleaned

    @field_validator("otp")
    @classmethod
    def _valid_otp(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v or "")
        if not re.fullmatch(r"\d{6}", cleaned):
            raise ValueError("OTP must be 6 digits")
        return cleaned

    @field_validator("name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        return sanitize_name(v)


class ChatTurn(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatTurn] = Field(..., min_length=1, max_length=40)
    session_id: Optional[str] = Field(None, max_length=100)


class ChatResponse(BaseModel):
    message: str
    session_id: str


# ─── Auth endpoints ────────────────────────────────────────────────────────
@app.post("/api/auth/send-otp")
async def send_otp(body: SendOTPRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(f"otp:{client_ip}", limit=5, window_seconds=60)
    rate_limit(f"otp:phone:{body.phone}", limit=3, window_seconds=300)

    otp_code = str(secrets.randbelow(1_000_000)).zfill(6)
    db = get_db()
    db["otps"].update_one(
        {"phone": body.phone},
        {
            "$set": {
                "phone": body.phone,
                "otp": otp_code,
                "created_at": datetime.now(timezone.utc),
                "attempts": 0,
                "verified": False,
            }
        },
        upsert=True,
    )

    sms_result = await send_sms_fast2sms(body.phone, otp_code)

    response: dict = {
        "success": True,
        "message": f"OTP sent to +91 {body.phone}",
        "sms_sent": sms_result.get("sent", False),
    }

    # Only echo the OTP back in development; never in production.
    if not sms_result.get("sent", False) and not IS_PRODUCTION:
        response["dev_otp"] = otp_code
        response["note"] = "SMS provider not configured — dev OTP returned for local testing."

    return response


@app.post("/api/auth/verify-otp")
async def verify_otp(body: VerifyOTPRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(f"verify:{client_ip}", limit=10, window_seconds=60)

    db = get_db()
    record = db["otps"].find_one({"phone": body.phone, "verified": False})
    if not record:
        raise HTTPException(status_code=400, detail="OTP not found or already used. Request a new one.")

    created = record["created_at"]
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) - created > timedelta(minutes=OTP_EXPIRE_MINS):
        db["otps"].delete_one({"phone": body.phone})
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if record.get("attempts", 0) >= 3:
        db["otps"].delete_one({"phone": body.phone})
        raise HTTPException(status_code=429, detail="Too many wrong attempts. Request a new OTP.")

    if record["otp"] != body.otp:
        db["otps"].update_one({"phone": body.phone}, {"$inc": {"attempts": 1}})
        remaining = max(0, 3 - (record.get("attempts", 0) + 1))
        raise HTTPException(status_code=400, detail=f"Incorrect OTP. {remaining} attempts remaining.")

    db["otps"].update_one({"phone": body.phone}, {"$set": {"verified": True}})

    # Determine if this is a brand-new user (so we only log new sign-ups to the Sheet).
    existing = db["users"].find_one({"phone": body.phone})
    is_new_user = existing is None
    name = body.name or (existing.get("name") if existing else "") or ""

    set_fields = {"phone": body.phone, "last_login": datetime.now(timezone.utc)}
    if body.name:
        set_fields["name"] = body.name
    db["users"].update_one(
        {"phone": body.phone},
        {
            "$set": set_fields,
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
                "user_id": str(uuid.uuid4()),
            },
        },
        upsert=True,
    )

    # Append name + number to the Google Sheet for new sign-ups (best-effort).
    if is_new_user:
        await log_to_sheet(name, body.phone)

    return {
        "success": True,
        "message": "Login successful. Welcome to Yoga Intelligence.",
        "token": make_jwt(body.phone),
        "phone": body.phone,
        "name": name,
    }


@app.get("/api/auth/me")
async def get_me(user=Depends(get_current_user)):
    phone = user["sub"]
    try:
        record = get_db()["users"].find_one({"phone": phone}, {"_id": 0})
    except HTTPException:
        record = None
    return {
        "phone": phone,
        "name": (record.get("name") if record else "") or "",
        "member": bool(record),
        "joined": str(record.get("created_at")) if record else None,
    }


# ─── Health ─────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    # Intentionally does not expose the AI provider/model — YoYogi is presented
    # as our own assistant, and we avoid leaking internal stack details.
    return {
        "status": "healthy",
        "service": "Yoga Intelligence API",
        "version": "3.0.0",
        "ai": "ready" if GEMINI_API_KEY else "offline",
    }


# ─── YoYogi AI (Google Gemini 2.5 Flash) ───────────────────────────────────
YOYOGI_SYSTEM_PROMPT = """You are YoYogi — the official AI wellness companion of Yoga Intelligence, founded and personally guided by Yogacharya Mrityunjay Pandey.

# YOUR EXCLUSIVE EXPERTISE (the ONLY topics you can discuss):
- Yoga: asanas, sequences, breathing (pranayama), meditation, modifications, safety, lineage
- Ayurveda: doshas (vata/pitta/kapha), classical herbs, daily routines (dinacharya), seasonal practices
- Health: physical fitness, nutrition, sleep, immunity, common preventive guidance
- Mental wellness: stress, anxiety, focus, mindfulness, emotional balance
- Lifestyle: yogic daily habits, posture, hydration, work-life rhythm, screen detox
- Yoga Intelligence brand: Yogacharya Mrityunjay Pandey's programs (Power Yoga, Acupressure Therapy, Back & Spine Care, Stress Relief, Weight Management, Beginner's Foundation) and the Yoga Intelligence Ayurvedic product line.

# STRICT REFUSAL POLICY (NON-NEGOTIABLE):
If the user asks ANY question outside the topics above (politics, news, sports, finance, tech, coding, math, history, trivia, entertainment, recipes unrelated to Ayurveda, weather, travel, etc.), you MUST politely refuse with this exact pattern:

  "I'm YoYogi — I can only help with yoga, Ayurveda, health, and wellness questions. Please ask me about poses, breathing, Ayurvedic remedies, fitness, nutrition, or mental wellness, and I'll happily guide you. \U0001F64F"

Do NOT attempt to answer the off-topic question even briefly. Refuse first, then redirect.

# RESPONSE STYLE:
- Warm, calm, knowledgeable, encouraging — a yogacharya's tone.
- Concise: 2-4 short paragraphs OR a short bulleted list. Never long essays.
- Practical and actionable: always include a clear next step the user can take today.
- Include safety caveats for postures (e.g., "avoid if you have a recent spinal injury").
- For serious medical conditions (chest pain, severe anxiety, pregnancy complications, chronic disease), ALWAYS advise consulting a qualified doctor first.
- Where appropriate, gently suggest connecting with Yogacharya Mrityunjay Pandey on WhatsApp for a personalised program.

# COMPLIANCE:
- Never promise cures or guaranteed outcomes.
- Never recommend stopping prescribed medication.
- Never discuss pricing of Yoga Intelligence programs/products (always defer to WhatsApp).
- Stay STRICTLY within yoga / Ayurveda / health / wellness.

# IDENTITY (IMPORTANT):
You are "YoYogi", the personal wellness companion created by Yoga Intelligence. You were
crafted by the Yoga Intelligence team under the guidance of Yogacharya Mrityunjay Pandey.
NEVER say or imply that you are Gemini, Google, Bard, an LLM, a "language model", or that
you are powered by any third-party AI. If asked what you are, who made you, or which model
you use, simply say: "I'm YoYogi, Yoga Intelligence's personal wellness companion — here to
guide you on yoga, Ayurveda, and healthy living." Then return to helping with their wellness.

Now respond to the user's question following ALL the rules above."""


_FALLBACK_REPLY = (
    "I'm YoYogi — I can only help with yoga, Ayurveda, health, and wellness questions. "
    "Please ask me about poses, breathing, Ayurvedic remedies, fitness, nutrition, or mental "
    "wellness, and I'll happily guide you. \U0001F64F"
)


def _extract_text(response) -> str:
    """Safely pull text from a Gemini response.

    `response.text` RAISES (not returns empty) when the model returns no usable
    text part — e.g. a safety/recitation block or an empty candidate. We must
    never let that bubble up as a 502; instead we degrade to a branded fallback
    so YoYogi always answers gracefully.
    """
    try:
        text = (response.text or "").strip()
        if text:
            return text
    except Exception:
        pass

    # Manually stitch any text parts from the candidates.
    try:
        parts_text = []
        for cand in getattr(response, "candidates", None) or []:
            content = getattr(cand, "content", None)
            for part in (getattr(content, "parts", None) or []):
                t = getattr(part, "text", "")
                if t:
                    parts_text.append(t)
        joined = "".join(parts_text).strip()
        if joined:
            return joined
    except Exception:
        pass

    return _FALLBACK_REPLY


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest, user=Depends(get_current_user)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="YoYogi is offline (AI key not configured)")

    phone = user["sub"]
    rate_limit(f"chat:{phone}", limit=20, window_seconds=60)
    rate_limit(f"chat:{phone}:hour", limit=120, window_seconds=3600)

    if body.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")

    last_user_msg = sanitize_text(body.messages[-1].content)
    if not last_user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [
        {
            "role": "user" if turn.role == "user" else "model",
            "parts": [sanitize_text(turn.content)],
        }
        for turn in body.messages[:-1]
    ]

    session_id = body.session_id or f"yoyogi_{phone}_{uuid.uuid4().hex[:8]}"

    try:
        model = genai.GenerativeModel(
            model_name=LLM_MODEL,
            system_instruction=YOYOGI_SYSTEM_PROMPT,
            generation_config={
                "temperature": 0.75,
                "top_p": 0.95,
                "max_output_tokens": 1024,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            ],
        )
        chat_session = model.start_chat(history=history)
        response = await chat_session.send_message_async(last_user_msg)
        text = _extract_text(response)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="YoYogi is having trouble right now. Please try again in a moment.")

    # NOTE: YoYogi conversations are intentionally NOT stored anywhere. Context
    # exists only for the live request (sent by the client) and is discarded
    # immediately. Nothing is written to the database — the chat is ephemeral and
    # disappears the moment the user closes the site.
    return ChatResponse(message=text, session_id=session_id)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak internal errors to clients in production.
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})
