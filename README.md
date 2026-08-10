# FactoryAI Copilot

> AI-powered Manufacturing Incident Analysis & Maintenance Copilot

---

## 🚀 Live Demo

| Service  | URL |
|----------|-----|
| **Frontend** (Vercel) | [https://factory-ai-i4cb.vercel.app](https://factory-ai-i4cb.vercel.app) |
| **Backend API** (Render) | [https://factoryai-79fc.onrender.com](https://factoryai-79fc.onrender.com) |
| **API Health Check** | [https://factoryai-79fc.onrender.com/api/health](https://factoryai-79fc.onrender.com/api/health) |
| **Swagger Docs** | [https://factoryai-79fc.onrender.com/docs](https://factoryai-79fc.onrender.com/docs) |

> **Note:** The Render backend may take ~30 seconds to wake up on first request (free tier cold start).

---

## Overview

FactoryAI Copilot is a production-oriented MVP demonstrating AI-assisted manufacturing incident analysis and maintenance support. It provides two core features for industrial plant operators and maintenance engineers:

1. **Incident Analyzer** — Submit machine telemetry (ID, temperature, vibration) and a free-text incident description. The AI returns a structured report: root cause, severity, immediate actions, recommended maintenance, safety precautions, required tools, and estimated downtime.

2. **Maintenance Copilot Chat** — A domain-locked chatbot that answers questions exclusively about manufacturing, industrial maintenance, predictive diagnostics, and factory safety. Off-topic queries and common instruction-override patterns are detected and declined.

> ⚠️ **Safety Notice:** FactoryAI Copilot is a demonstration and decision-support tool. AI-generated recommendations must be validated by qualified personnel and applicable plant safety procedures before any maintenance action is taken.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 15 · TypeScript · Tailwind  |
| Backend   | FastAPI · Python 3.12 · Pydantic v2 |
| AI        | Gemini 2.5 Flash (`google-genai`)   |
| Security  | bleach · slowapi · custom guards    |

---

## Architecture

```
factoryai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py     # POST /api/analyze, POST /api/chat, GET /api/health
│   │   ├── services/
│   │   │   └── ai.py            # Gemini 2.5 Flash calls + expert fallback engine
│   │   ├── config.py            # pydantic-settings (env vars)
│   │   ├── models.py            # Enums: SeverityLevel, ConfidenceLevel
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── security.py          # Input sanitization, injection detection, output guard
│   │   └── main.py              # FastAPI app, CORS, rate limiter
│   ├── .env                     # GEMINI_API_KEY (never commit)
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── globals.css          # Design tokens, animations, utility classes
    │   ├── layout.tsx           # Root layout + SEO metadata
    │   └── page.tsx             # Main page (tab switching)
    ├── components/
    │   ├── Header.tsx           # Sticky nav + backend health badge
    │   ├── IncidentAnalyzer.tsx # Incident form, validation, skeleton loader
    │   ├── AnalysisResult.tsx   # Structured AI result display
    │   └── MaintenanceChat.tsx  # Real-time chat with typing indicator
    ├── lib/
    │   └── api.ts               # Typed API client (fetch wrapper)
    └── .env.local               # NEXT_PUBLIC_API_URL
```

---

## Security Implementation

| Guard                       | Implementation |
|-----------------------------|----------------|
| Input sanitization          | `bleach.clean()` strips all HTML tags before any processing |
| Prompt injection mitigation | Regex-based detection of common instruction-override patterns combined with system-level domain constraints. Does not claim to eliminate all injection vectors. |
| Output confidence guard     | Strips hallucinated float percentages → qualitative `Low / Medium / High` |
| Length limits               | Incident description: 1000 chars · Chat message: 500 chars (enforced by Pydantic schema) |
| Rate limiting               | `slowapi` — 30 requests/minute on `/api/analyze` and `/api/chat`. `ProxyHeadersMiddleware` configured so Render's load balancer forwards the real client IP via `X-Forwarded-For`. The `/health` endpoint is intentionally exempt so monitoring checks are never rate-limited. |
| CORS                        | Allowed origins read from `CORS_ORIGINS` environment variable (comma-separated). Defaults to `localhost:3000`. Set to your Vercel URL in production. |
| Domain locking (chat)       | System prompt + keyword fast-path filter rejects off-topic queries |
| Environment variables       | API key loaded from `.env` via `pydantic-settings`, never hardcoded |
| Gemini timeout              | SDK `http_options.timeout` set to 5000 ms with `retry_options.attempts=1` — on timeout or API failure the deterministic fallback engine activates automatically |

---

## Running Locally

### 1. Backend (FastAPI)

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### 2. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App available at: `http://localhost:3000`

---

## API Endpoints

| Method | Path             | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/health`    | Backend + security status          |
| POST   | `/api/analyze`   | Incident analysis (AI + fallback)  |
| POST   | `/api/chat`      | Maintenance copilot chat           |

### Sample Incident Request

```json
POST /api/analyze
{
  "machine_id": "CNC-MILL-04",
  "temperature": 92.5,
  "vibration": 14.2,
  "description": "Grinding noise with elevated vibration over past 2 hours."
}
```

### Sample Chat Request

```json
POST /api/chat
{
  "message": "What causes overheating in CNC spindle motors?"
}
```

---

## AI Fallback Engine

If the Gemini API key is absent or the API call fails, the backend automatically falls back to a **deterministic rule-based engine** to ensure the demo always returns a structured response.

The fallback engine uses configurable demonstration thresholds:

- **CRITICAL**: Temperature > 80°C **AND** Vibration > 10 mm/s  
- **HIGH**: Temperature > 80°C  
- **MEDIUM**: Vibration > 10 mm/s  
- **LOW**: All parameters within normal range

> These thresholds are illustrative and are not intended to replace machine-specific engineering limits or inspection procedures. Different equipment operates within different acceptable temperature and vibration ranges.

---

## Notes for Demo

- The app works **without a Gemini API key** using the expert fallback engine. If the Gemini API is unreachable or fails, the fallback activates automatically within the configured timeout — it does not hang or crash.
- Add your key to `backend/.env` for full AI-powered responses.
- Rate limiter is configured at 30 req/min on `/analyze` and `/chat`. The `/health` endpoint is intentionally exempt.
- The security refusal response for prompt injection demonstrates: *"Ignore previous instructions"* → HTTP 400 immediately.
- CORS allowed origins are set via the `CORS_ORIGINS` environment variable. Restrict this to your Vercel URL in production.

---

## Safety Disclaimer

> FactoryAI Copilot is a demonstration decision-support tool. AI-generated recommendations must be validated by qualified personnel and applicable plant safety procedures before maintenance actions are taken.
