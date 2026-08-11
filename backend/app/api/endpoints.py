from fastapi import APIRouter, Request, HTTPException, status
from app.schemas import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    SecurityRefusalResponse
)
from app.security import (
    limiter,
    detect_prompt_injection
)
from app.services.ai import analyze_incident_ai, chat_maintenance_ai
from app.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": "Gemini 2.5 Flash",
        "security_guardrails": {
            "prompt_injection_protection": "active",
            "input_sanitization": "active (bleach)",
            "output_confidence_guard": "active",
            "rate_limiter": "active (slowapi)"
        }
    }

@router.post(
    "/analyze",
    response_model=IncidentAnalysisResponse,
    responses={400: {"model": SecurityRefusalResponse}}
)
@limiter.limit(settings.RATE_LIMIT_PER_MINUTE)
def analyze_incident(request: Request, body: IncidentAnalysisRequest):
    # 1. Prompt Injection check
    if detect_prompt_injection(body.description) or detect_prompt_injection(body.machine_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: Input contains prohibited prompt injection patterns."
        )

    # 3. Call AI Service
    return analyze_incident_ai(body)

@router.post(
    "/chat",
    response_model=ChatMessageResponse,
    responses={400: {"model": SecurityRefusalResponse}}
)
@limiter.limit(settings.RATE_LIMIT_PER_MINUTE)
def chat_copilot(request: Request, body: ChatMessageRequest):
    print(f"[CHAT] Request received: {body.message[:60]!r}")
    # 1. Prompt Injection check
    if detect_prompt_injection(body.message):
        print("[CHAT] Injection validation: FAIL (blocked at endpoint)")
        return ChatMessageResponse(
            response="I'm designed specifically for manufacturing engineering assistance.",
            is_refusal=True,
            confidence="High",
            source="fallback"
        )

    # 2. Call Chat AI Service
    return chat_maintenance_ai(body.message)
