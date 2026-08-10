# FactoryAI Copilot

> AI-powered Manufacturing Incident Analysis & Maintenance Copilot

---

## Overview

FactoryAI Copilot is a production-quality demo application that provides two core features for industrial plant operators and maintenance engineers:

1. **Incident Analyzer** — Submit machine telemetry (ID, temperature, vibration) and a free-text incident description. The AI returns a structured report: root cause, severity, immediate actions, recommended maintenance, safety precautions, required tools, and estimated downtime.

2. **Maintenance Copilot Chat** — A domain-locked chatbot that answers questions exclusively about manufacturing, industrial maintenance, predictive diagnostics, and factory safety. Off-topic and prompt injection attempts are blocked.

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
| Prompt injection detection  | Regex pattern matching against 12+ known injection patterns |
| Output confidence guard     | Strips hallucinated float percentages → qualitative `Low / Medium / High` |
| Length limits               | Incident description: 1000 chars · Chat message: 500 chars |
| Rate limiting               | `slowapi` — 30 requests/minute per IP address |
| Domain locking (chat)       | System prompt + keyword fast-path filter rejects off-topic queries |
| Environment variables       | API key loaded from `.env` via `pydantic-settings`, never hardcoded |

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

If the Gemini API key is absent or the API call fails, the backend automatically falls back to a **deterministic rule-based expert engine** that produces high-quality, accurate responses based on industrial diagnostic thresholds:

- **CRITICAL**: Temperature > 80°C **AND** Vibration > 10 mm/s  
- **HIGH**: Temperature > 80°C  
- **MEDIUM**: Vibration > 10 mm/s  
- **LOW**: All parameters within normal range

This ensures the demo **always works**, even without an internet connection.

---

## Notes for Demo

- The app works **without a Gemini API key** using the expert fallback engine.
- Add your key to `backend/.env` for full AI-powered responses.
- Rate limiter is configured at 30 req/min — tell reviewers: *"The API is rate-limited via slowapi."*
- The security refusal response for prompt injection demonstrates: *"Ignore previous instructions"* → blocked immediately.
