import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FactoryAI Copilot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    
    # Security & Limits
    MAX_INCIDENT_DESC_LENGTH: int = 1000
    MAX_CHAT_MSG_LENGTH: int = 500
    RATE_LIMIT_PER_MINUTE: str = "30/minute"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
