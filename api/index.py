"""
Yoga Intelligence API — Vercel Python serverless entry point.

Exposes the FastAPI ASGI app as `app` (auto-detected by @vercel/python).
All endpoints live under /api/* so the same routing works locally and on Vercel.
"""

from __future__ import annotations

import hashlib
import hmac
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

load_dotenv()

# ─── Config ─────────────────────────────────────────────────────────────────
# No database. The app is fully stateless:
#   • OTP is verified via a short-lived SIGNED token (no storage)
#   • the login session is a JWT held in the browser
#   • new sign-ups (name + phone) are sent only to a Google Sheet
#   • YoYogi chats are ephemeral and never stored
# Email OTP via Resend (https://resend.com) — free, instant, no DLT/billing.
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
# From address. Use Resend's shared sender until you verify your own domain.
OTP_FROM_EMAIL = os.environ.get("OTP_FROM_EMAIL", "Yoga Intelligence <onboarding@resend.dev>").strip()
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


# ─── Auth helpers ───────────────────────────────────────────────────────────
bearer = HTTPBearer(auto_error=False)


def make_jwt(phone: str, name: str = "") -> str:
    payload = {
        "sub": phone,
        "name": name,
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


# ─── Stateless OTP (no database) ─────────────────────────────────────────────
# send-otp hashes the code into a short-lived signed token and returns it to the
# client; verify-otp checks the user's entered code against that token. The plain
# OTP is never stored anywhere — only its salted hash inside a signed, expiring JWT.
def _otp_hash(key: str, otp: str) -> str:
    return hmac.new(JWT_SECRET.encode(), f"{key}:{otp}".encode(), hashlib.sha256).hexdigest()


def make_otp_token(email: str, otp: str) -> str:
    payload = {
        "purpose": "otp",
        "email": email,
        "h": _otp_hash(email, otp),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_otp_token(token: str, email: str, otp: str) -> None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Code expired. Please request a new one.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid session. Please request a new code.")
    if payload.get("purpose") != "otp" or payload.get("email") != email:
        raise HTTPException(status_code=400, detail="Invalid session. Please request a new code.")
    if not hmac.compare_digest(payload.get("h", ""), _otp_hash(email, otp)):
        raise HTTPException(status_code=400, detail="Incorrect code. Please try again.")


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


# ─── Email OTP (Resend) ──────────────────────────────────────────────────────
def _otp_email_html(otp: str) -> str:
    return f"""\
<!doctype html><html><body style="margin:0;background:#FDFAF5;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-family:Poppins,Arial,sans-serif;font-weight:800;font-size:22px;color:#F07A1A;">YOGA INTELLIGENCE</div>
      <div style="font-size:12px;color:#3A7D2C;letter-spacing:1px;">By Yogacharya Mrityunjay Pandey</div>
    </div>
    <div style="background:#fff;border:1px solid #eee;border-radius:18px;padding:32px 28px;text-align:center;box-shadow:0 8px 30px rgba(16,24,40,0.06);">
      <div style="height:4px;width:60px;border-radius:4px;margin:0 auto 22px;background:linear-gradient(90deg,#3A7D2C,#F07A1A,#F5C118);"></div>
      <h1 style="font-family:Poppins,Arial,sans-serif;font-size:20px;color:#1A1A1A;margin:0 0 8px;">Verify your login</h1>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">Enter this code to continue. It expires in {OTP_EXPIRE_MINS} minutes.</p>
      <div style="font-family:Poppins,Arial,sans-serif;font-weight:800;font-size:40px;letter-spacing:10px;color:#3A7D2C;background:#F8FBF6;border-radius:12px;padding:16px 0;">{otp}</div>
      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <p style="text-align:center;color:#9CA3AF;font-size:11px;margin-top:18px;">© Yoga Intelligence — संकल्प स्वस्थ भारत का 🇮🇳</p>
  </div>
</body></html>"""


async def send_otp_email(email: str, otp: str) -> dict:
    """Email the OTP via Resend. Free, instant, no DLT. Returns delivery status."""
    if not RESEND_API_KEY:
        return {"sent": False, "reason": "RESEND_API_KEY not set on the server"}

    headers = {"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "from": OTP_FROM_EMAIL,
        "to": [email],
        "subject": f"{otp} is your Yoga Intelligence code",
        "html": _otp_email_html(otp),
        "text": f"Your Yoga Intelligence verification code is {otp}. It expires in {OTP_EXPIRE_MINS} minutes.",
    }
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post("https://api.resend.com/emails", headers=headers, json=payload)
            if r.status_code in (200, 201):
                return {"sent": True}
            reason = (r.json().get("message") if r.headers.get("content-type", "").startswith("application/json") else r.text) or f"HTTP {r.status_code}"
    except Exception as exc:
        reason = f"{type(exc).__name__}"

    print(f"[Resend] email OTP FAIL for {email}: {reason}")
    return {"sent": False, "reason": reason}


# ─── Google Sheet logging (best-effort, never blocks login) ─────────────────
async def log_to_sheet(name: str, phone: str, email: str = "") -> None:
    if not GOOGLE_SHEET_WEBHOOK_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            await client.post(
                GOOGLE_SHEET_WEBHOOK_URL,
                json={"name": name, "phone": phone, "email": email},
            )
    except Exception:
        # Logging to the sheet must never break authentication.
        pass


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email: str) -> bool:
    return bool(_EMAIL_RE.match((email or "").strip())) and len(email) <= 120


# ─── Models ─────────────────────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5, max_length=120)

    @field_validator("phone")
    @classmethod
    def _valid_phone(cls, v: str) -> str:
        cleaned = normalize_phone(v)
        if not is_valid_phone(cleaned):
            raise ValueError("Invalid phone — must be a 10-digit Indian mobile number")
        return cleaned

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        cleaned = (v or "").strip().lower()
        if not is_valid_email(cleaned):
            raise ValueError("Please enter a valid email address")
        return cleaned


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5, max_length=120)
    otp: str = Field(..., min_length=6, max_length=6)
    otp_token: str = Field(..., min_length=10, max_length=2000)
    name: str = Field("", max_length=80)

    @field_validator("phone")
    @classmethod
    def _valid_phone(cls, v: str) -> str:
        cleaned = normalize_phone(v)
        if not is_valid_phone(cleaned):
            raise ValueError("Invalid phone")
        return cleaned

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        cleaned = (v or "").strip().lower()
        if not is_valid_email(cleaned):
            raise ValueError("Invalid email")
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
    rate_limit(f"otp:email:{body.email}", limit=3, window_seconds=300)

    otp_code = str(secrets.randbelow(1_000_000)).zfill(6)
    # Stateless: the code lives only inside this signed, 5-minute token.
    otp_token = make_otp_token(body.email, otp_code)

    email_result = await send_otp_email(body.email, otp_code)
    sent = email_result.get("sent", False)

    response: dict = {
        "success": True,
        "message": f"Verification code sent to {body.email}",
        "sms_sent": sent,  # kept key name for frontend compatibility
        "otp_token": otp_token,
    }

    if not sent:
        # Surface the email-provider reason so the owner can diagnose quickly.
        response["sms_error"] = email_result.get("reason", "unknown")
        if not IS_PRODUCTION:
            response["dev_otp"] = otp_code
            response["note"] = "Email send failed — dev OTP returned for local testing."

    return response


@app.post("/api/auth/verify-otp")
async def verify_otp(body: VerifyOTPRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    # Best-effort brute-force protection (no DB): cap verify attempts per IP/email.
    rate_limit(f"verify:{client_ip}", limit=10, window_seconds=60)
    rate_limit(f"verify:email:{body.email}", limit=6, window_seconds=300)

    # Validates the signed OTP token + entered code; raises on expiry/mismatch.
    verify_otp_token(body.otp_token, body.email, body.otp)

    name = body.name or ""

    # Record the sign-up (name + phone + email) to the Google Sheet only.
    # Best-effort — never blocks login. The only place details are persisted.
    await log_to_sheet(name, body.phone, body.email)

    return {
        "success": True,
        "message": "Login successful. Welcome to Yoga Intelligence.",
        "token": make_jwt(body.phone, name),
        "phone": body.phone,
        "name": name,
    }


@app.get("/api/auth/me")
async def get_me(user=Depends(get_current_user)):
    # Stateless: everything we know about the session lives in the JWT itself.
    return {
        "phone": user.get("sub", ""),
        "name": user.get("name", "") or "",
        "member": True,
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
