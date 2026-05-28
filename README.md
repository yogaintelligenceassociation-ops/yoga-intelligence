# Yoga Intelligence

> Premium Indian wellness brand site for **Yoga Intelligence**, founded and guided by **Yogacharya Mrityunjay Pandey**. Single-page experience featuring the **YoYogi** AI wellness companion.

## What's inside

- **Frontend** — React 19 + Create React App (Craco) + Tailwind + shadcn/ui + Framer Motion. Cinematic hero video, premium card system, mobile-first layout.
- **Backend** — Python FastAPI deployed as a **Vercel serverless function** at `/api/*`. Endpoints for OTP auth, JWT issuance, and the YoYogi chat.
- **No database** — fully stateless: OTP is a short-lived signed token, the session is a JWT, sign-ups (name + phone) go to a Google Sheet, and chats are ephemeral (never stored).
- **Auth** — Phone-number OTP via **Fast2SMS**, long-lived JWT for a persistent session.
- **AI** — YoYogi, with a strict refusal prompt that confines it to yoga, Ayurveda, health, and wellness topics.

## Project layout

```
.
├── api/
│   └── index.py            # FastAPI ASGI app — all /api/* endpoints
├── public/
│   ├── images/             # Logo + teacher + product photos (self-hosted)
│   ├── videos/             # Hero MP4s + poster
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── components/         # React components (Navbar, Hero, About, …, YoYogi, ChatWidget, AuthModal)
│   ├── constants/social.js # Social URLs, brand colors, image registry
│   ├── hooks/useAuth.js    # Auth hook on top of the API client
│   ├── lib/api.js          # Typed fetch wrapper for /api/*
│   ├── App.js
│   └── index.js
├── craco.config.js         # CRA override (path alias + dev-server /api proxy)
├── package.json
├── requirements.txt        # Python deps for the serverless function
├── vercel.json             # Build + rewrite + security headers config
├── .env.example            # All env vars (copy to .env)
└── README.md
```

## Local development

### Prerequisites
- **Node.js 18+** (npm)
- **Python 3.11+**
- *(No database to install — the backend is stateless.)*

### One-time setup

```bash
# 1. Install JS deps
npm install

# 2. Install Python deps (recommended: virtualenv)
python -m venv .venv
.venv\Scripts\activate          # PowerShell on Windows
# or: source .venv/bin/activate  on macOS/Linux
pip install -r requirements.txt

# 3. Copy env template and fill in your keys
copy .env.example .env          # cp on macOS/Linux
```

### Required env vars (`.env`)

| Variable | Purpose | Required |
| --- | --- | --- |
| `GEMINI_API_KEY` | Google AI Studio key for YoYogi | Yes (chat) |
| `JWT_SECRET_KEY` | Random secret for signing JWTs + OTP tokens (`openssl rand -hex 64`) | Yes in prod |
| `FAST2SMS_API_KEY` | SMS provider for OTP delivery | Optional — leave blank for dev (the API will return `dev_otp` in the response) |
| `GOOGLE_SHEET_WEBHOOK_URL` | Apps Script Web App URL that logs sign-ups (name + phone) to a Google Sheet | Optional |
| `CORS_ORIGINS` | Comma-separated allow-list (`*` in dev) | No |

### Logging sign-ups to a Google Sheet (optional, ~2 minutes)

On a **new** sign-up the backend POSTs `{ "name": "...", "phone": "..." }` to a webhook you control. The easiest webhook is a Google Apps Script bound to a Sheet:

1. Create a Google Sheet. Add headers in row 1: `Timestamp`, `Name`, `Phone`.
2. **Extensions → Apps Script**, paste:
   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([new Date(), data.name || "", "'" + (data.phone || "")]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. **Deploy → New deployment → Web app**. Execute as **Me**, access **Anyone**. Copy the `/exec` URL.
4. Put that URL in `GOOGLE_SHEET_WEBHOOK_URL` (locally in `.env`, in prod in Vercel env vars).

Only the name and phone are sent — nothing else. If the variable is blank or the webhook fails, login still works normally.

### Run it

You need two terminals:

```bash
# Terminal 1 — backend (FastAPI)
uvicorn api.index:app --reload --port 8000

# Terminal 2 — frontend (CRA via Craco)
npm start
```

The frontend dev server proxies `/api/*` to `http://localhost:8000`, so the same code that runs on Vercel works locally.

## Deploying to GitHub + Vercel

### One-time prerequisites
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free tier works)
- A [Fast2SMS](https://www.fast2sms.com/) account + API key (for production OTP delivery)
- (Optional) A Google Sheet + Apps Script webhook for sign-up logging
- A GitHub account
- A free Vercel account, signed in with GitHub
- *(No database — nothing to provision.)*

### Step 1 — push to GitHub

```bash
cd C:\Users\Asus\Desktop\Yoga_Intelligence
git init
git add .
git commit -m "Initial commit — Yoga Intelligence v3 (Vercel-ready)"

# Create an empty repo on github.com (no README/license — they'd conflict).
# Then:
git branch -M main
git remote add origin https://github.com/<your-username>/yoga-intelligence.git
git push -u origin main
```

### Step 2 — deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your GitHub repo.
3. Vercel auto-detects: Framework = *Create React App*, Output = `build`, Python serverless at `/api`.
4. Under **Environment Variables**, add (from `.env.example`):
   - `GEMINI_API_KEY` — your Gemini key
   - `JWT_SECRET_KEY` — a long random string (`openssl rand -hex 64`)
   - `FAST2SMS_API_KEY` — your Fast2SMS key
   - `GOOGLE_SHEET_WEBHOOK_URL` — your Apps Script `/exec` URL (optional)
   - `CORS_ORIGINS` — your final domain, e.g. `https://yogaintelligence.in`
5. **Deploy.** The first build takes 2–3 minutes. You'll get a `*.vercel.app` URL.

### Step 3 — add your custom domain

1. Buy a domain (any registrar — Namecheap, Google Domains, GoDaddy, etc.).
2. In Vercel: **Project → Settings → Domains → Add**. Enter your domain.
3. Vercel will show you the DNS records to add. Either:
   - Point your domain's nameservers to Vercel (recommended), **or**
   - Add the A / CNAME records Vercel gives you at your registrar.
4. SSL is provisioned automatically — your site is live on HTTPS within minutes.
5. Update `CORS_ORIGINS` in Vercel's env vars to your final domain and redeploy.

### Push updates

After the initial deploy, every `git push` to `main` triggers an automatic Vercel rebuild — no manual step.

## Security audit

- **App code**: validated, sanitised, rate-limited, JWT-gated, CSP-hardened. No production secrets in source.
- **Frontend bundle**: 171 KB JS gzipped, no vulnerable runtime libraries.
- **npm audit notes**: ~28 advisories appear when you run `npm audit`. They are all transitive dependencies of `react-scripts`' build/dev tooling (`webpack-dev-server`, `jsonpath`, `uuid` v8). **None are present in the production bundle that Vercel serves to users** — `webpack-dev-server` is a devDependency that only runs locally during `npm start`. The deployed application is unaffected. Migrating off Create React App (to Vite or Next.js) would eliminate the advisories — that's a separate, larger change worth doing eventually but not required to ship.

## Security highlights

- All secrets read from env vars; **no defaults** in production
- JWT-signed auth; tokens stored in `localStorage`
- Rate limiting on OTP send/verify and chat endpoints
- Input validation (pydantic) + HTML escaping on user-supplied chat content
- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy headers
- CORS allow-list (use exact origins in production, never `*`)
- Auto-expiring OTPs (5 min TTL) and 3-attempt cap
- Gemini safety filters at `BLOCK_ONLY_HIGH`
- No dev OTPs leaked in production responses

## YoYogi behaviour

YoYogi is built around a strict refusal prompt: it only answers questions about yoga, Ayurveda, health, fitness, nutrition, breathwork, meditation, mindfulness, and the Yoga Intelligence brand. Off-topic prompts trigger a fixed, branded refusal pattern. See `api/index.py` (`YOYOGI_SYSTEM_PROMPT`) for the full prompt.

## Brand assets

The brand mark (logo), teacher photos, and the two branded product photos (Sitopaladi Churna + Herbal Hair Pack) live in `public/images/`. Replace any of them by dropping a same-named file into that folder — no code change required.

## License

© Yoga Intelligence. All rights reserved.
