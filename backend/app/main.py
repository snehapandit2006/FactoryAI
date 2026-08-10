from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.security import limiter
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered Manufacturing Incident Analysis & Maintenance Copilot API"
)

# SlowAPI rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable ProxyHeadersMiddleware to trust the X-Forwarded-For header from Render's load balancer.
# On Render, the load balancer is guaranteed to strip spoofed headers from untrusted clients,
# making `trusted_hosts=["*"]` safe for this specific deployment architecture.
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for HTTP 400 security errors
@app.exception_handler(400)
async def custom_400_handler(request: Request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Security Refusal",
            "message": str(exc.detail) if hasattr(exc, "detail") else "Invalid request parameters.",
            "status_code": 400
        }
    )

# Include API Router under /api
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "Operational",
        "docs_url": "/docs",
        "api_endpoint": f"{settings.API_V1_STR}/health"
    }
