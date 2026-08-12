const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

export interface IncidentRequest {
  machine_id: string;
  temperature: number;
  vibration: number;
  description: string;
}

export interface IncidentResponse {
  incident_summary: string;
  possible_root_cause: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  immediate_actions: string[];
  recommended_maintenance: string[];
  safety_precautions: string[];
  required_tools: string[];
  estimated_downtime: string;
  additional_data_needed: string[];
  confidence: string;
  sanitized_input: boolean;
  source?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  is_refusal: boolean;
  confidence: string;
  source?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  ai_engine: string;
  gemini_available: boolean;
  security_guardrails: {
    prompt_injection_protection: string;
    input_sanitization: string;
    output_confidence_guard: string;
    rate_limiter: string;
  };
}

export async function checkBackendHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

export async function analyzeIncident(payload: IncidentRequest): Promise<IncidentResponse> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.detail || "Failed to analyze incident.");
  }

  return data;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.detail || "Failed to send chat message.");
  }

  return data;
}
