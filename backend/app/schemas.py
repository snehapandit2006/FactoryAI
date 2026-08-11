from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from app.models import SeverityLevel
from app.security import sanitize_input, detect_prompt_injection

class IncidentAnalysisRequest(BaseModel):
    machine_id: str = Field(..., description="ID or designation of the machine", min_length=2, max_length=50, examples=["CNC-MILL-04"])
    temperature: float = Field(..., description="Operating temperature in °C", ge=-50.0, le=500.0, examples=[88.5])
    vibration: float = Field(..., description="Vibration reading in mm/s or Hz", ge=0.0, le=200.0, examples=[14.2])
    description: str = Field(..., description="Detailed description of the incident", min_length=5, max_length=1000)

    @field_validator("machine_id", "description", mode="before")
    @classmethod
    def sanitize_string_fields(cls, value: str) -> str:
        if isinstance(value, str):
            return sanitize_input(value)
        return value

class IncidentAnalysisResponse(BaseModel):
    incident_summary: str
    possible_root_cause: str
    severity: SeverityLevel
    immediate_actions: List[str]
    recommended_maintenance: List[str]
    safety_precautions: List[str]
    required_tools: List[str]
    estimated_downtime: str
    additional_data_needed: List[str]
    confidence: str = Field(default="Medium", description="Qualitative confidence rating (e.g. Medium, High)")
    sanitized_input: bool = True
    source: str = Field(default="gemini", description="Source engine: 'gemini' or 'fallback'")

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User message to Maintenance Copilot", min_length=2, max_length=500)

    @field_validator("message", mode="before")
    @classmethod
    def sanitize_message(cls, value: str) -> str:
        if isinstance(value, str):
            return sanitize_input(value)
        return value

class ChatMessageResponse(BaseModel):
    response: str
    is_refusal: bool = False
    confidence: str = "High"
    source: str = Field(default="gemini", description="Source engine: 'gemini' or 'fallback'")

class SecurityRefusalResponse(BaseModel):
    error: str = "Security Refusal"
    message: str = "Request blocked due to security policy or prompt injection detection."
    status_code: int = 400
