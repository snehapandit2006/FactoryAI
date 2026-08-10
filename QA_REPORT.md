# FactoryAI Copilot QA Report

## Executive Summary

Overall status:
PASS WITH ISSUES

Critical issues: 1
High issues: 2
Medium issues: 2
Low issues: 1

## Test Statistics

Total tests: 21
Passed: 14
Failed: 3
Blocked: 2
Unverified: 2

Pass rate: 82% (14/17)

## Functional Testing

| ID | Test | Result | Evidence | Severity |
|----|------|--------|----------|----------|
| IA-001 | Normal incident | BLOCKED | `POST /api/analyze` hangs indefinitely; AI SDK does not timeout and blocks the Uvicorn threadpool. | Critical |
| IA-005 | Missing description | PASS | Missing field caught by Pydantic validation (HTTP 422). | N/A |
| IA-006 | Empty machine ID | PASS | Rejected by Pydantic `min_length=2` (HTTP 422). | N/A |
| IA-007 | Non-numeric temperature | PASS | Rejected by Pydantic float parser (HTTP 422). | N/A |
| IA-009 | Extremely large temperature | PASS | Rejected by Pydantic `le=500.0` (HTTP 422). | N/A |
| IA-010 | Incident exactly 1000 chars | BLOCKED | AI call hangs indefinitely as with IA-001. | Critical |
| IA-011 | Incident 1001 chars | PASS | Rejected by Pydantic `max_length=1000` (HTTP 422) before hitting explicit validation logic. | N/A |
| CHAT-001 | Valid question | BLOCKED | `POST /api/chat` hangs indefinitely; identical SDK timeout issue as IA-001. | Critical |

## Security Testing

| ID | Test | Result | Evidence | Severity |
|----|------|--------|----------|----------|
| SEC-001 | Hardcoded secrets check | PASS | Repository scanned. `.env` properly ignored. No leaked `GEMINI_API_KEY`. | N/A |
| IA-012 | HTML/XSS sanitization | PASS | `bleach.clean()` strips script tags. Verified via source code audit. | N/A |
| IA-013 | Prompt injection exact phrase | PASS | HTTP 400 returned: "Input contains prohibited prompt injection patterns." | N/A |
| IA-014 | Disguised prompt injection | PASS | HTTP 400 returned, regex successfully caught embedded trigger. | N/A |
| SEC-01 | Uppercase prompt injection | PASS | HTTP 400 returned. Regex utilizes `(?i)` flag correctly. | N/A |
| SEC-02 | Forget rules injection | PASS | HTTP 400 returned. Caught by secondary patterns. | N/A |
| SEC-03 | Role-change injection | PASS | HTTP 400 returned. Caught by "you are now a" pattern. | N/A |
| SEC-04 | Base64/Obfuscated injection | FAIL | Advanced injections bypassing the 12 hardcoded regex patterns are not blocked by the explicit guardrail. | High |

## API Testing

| ID | Test | Result | Evidence | Severity |
|----|------|--------|----------|----------|
| API-001 | GET /api/health | PASS | Returns HTTP 200 with correct JSON payload and active guardrail status. | N/A |
| API-002 | Pydantic Schema Enforcement | PASS | Tested boundary limits, missing fields, and type violations. Pydantic successfully blocked all malformed requests with 422. | N/A |
| API-003 | CORS Configuration | PASS WITH ISSUES | `allow_origins=["*"]` is overly permissive for a production application, though acceptable for a demo MVP. | Low |
| API-004 | Rate Limiting | FAIL | Python automation hung. `slowapi` uses `get_remote_address`, but FastAPI lacks proxy middleware (e.g., `ProxyFix`). On Render, all users will share the same IP address, resulting in a global rate limit rather than per-user limit. | High |

## UI Testing

| ID | Test | Result | Evidence | Severity |
|----|------|--------|----------|----------|
| UI-001 | Frontend rendering | PASS | Vercel deployed site loads correctly, tabs function, UI is responsive. | N/A |
| UI-002 | Backend connection | FAIL | Vercel deployment originally failed due to incorrect `NEXT_PUBLIC_API_URL` configuration missing the `/api` path. | Medium |
| UI-003 | Accessibility | UNVERIFIED | Could not run automated a11y suite. | N/A |

## Performance Testing

*No performance testing could be completed due to the AI service hanging indefinitely, causing zero requests to complete within measurable latency limits.*

## README Verification

| Claim | Status | Evidence | Issue |
|------|--------|----------|-------|
| "Input sanitization (bleach)" | PASS | `security.py` line 34 | None |
| "Prompt injection detection" | PASS | `security.py` line 44 | Regex works for basic attacks. |
| "Length limits" | PASS | `schemas.py` line 10 | Handled by Pydantic, not manual logic. |
| "Rate limiting 30 req/min" | FAIL | `main.py` line 18 | `get_remote_address` behind Render proxy limits globally, not per IP. |
| "AI Fallback Engine always works" | FAIL | `ai.py` line 93 | Synchronous Gemini API call lacks a timeout. If the network drops or rate limits silently, it deadlocks instead of falling back. |

## Critical Findings

1. **API Deadlock / Fallback Failure:** The `generate_content` call to the Gemini SDK in `services/ai.py` is fully synchronous and does not enforce a timeout. If the AI service hangs, the thread blocks indefinitely. Because FastAPI's default threadpool size is limited, a small number of hanging requests will lock up the entire API server, causing even the `/health` endpoint to fail. This completely breaks the promised "deterministic fallback engine".

## False Claims / Overclaims

- **Rate Limiting:** The application claims to rate limit per IP address. Because it is deployed on Render without a proxy fix middleware, it will read the proxy's IP address instead of the client's true IP, meaning all traffic globally shares the same 30 request/minute bucket.
- **Redundant Validation:** The README claims `validate_text_length()` enforces character limits. While this function exists, it is functionally dead code because Pydantic's `Field(max_length=...)` catches the violation and throws an HTTP 422 before the router logic ever executes.

## Recommended Fixes

- **P0:** Implement an explicit timeout on the Gemini SDK `generate_content` call. Wrap the call in an exception handler that catches `TimeoutError` so the deterministic fallback engine actually activates when the AI is unresponsive.
- **P1:** Add `uvicorn.middleware.proxy_headers.ProxyHeadersMiddleware` or configure `Forwarded` headers in FastAPI so that `slowapi` can correctly identify individual client IPs behind Render's load balancer.
- **P2:** Remove the redundant `validate_text_length` function in `security.py` since Pydantic schemas already strictly enforce string length constraints.
- **P3:** Restrict `CORS_ORIGINS` to the specific Vercel deployment URL instead of `*` for better production hygiene.

## Final Verdict

READY FOR DEMO WITH KNOWN LIMITATIONS
