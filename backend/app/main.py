from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & local demo testing
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
