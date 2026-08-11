import re
import bleach
from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize SlowAPI rate limiter
limiter = Limiter(key_func=get_remote_address)

# Known prompt injection patterns
INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|above|your|system)?\s*(instructions?|rules?)",
    r"(?i)disregard\s+(all\s+)?(previous|above|your|system)?\s*(instructions?|rules?)",
    r"(?i)forget\s+(all\s+)?(previous|above|your|system)?\s*(rules?|instructions?)",
    r"(?i)override\s+(all\s+)?(previous|above|your|system|security)?\s*(instructions?|rules?|security)",
    r"(?i)bypass\s+(all\s+)?(previous|above|your|system|security|restrictions)?\s*(instructions?|rules?|restrictions)?",
    r"(?i)pretend\s+(the\s+)?(manufacturing\s+)?(restriction|rule|requirement)s?\s+(doesn't|does\s+not|don't)\s+exist",
    r"(?i)pretend\s+to\s+be",
    r"(?i)you\s+are\s+now\s+a",
    r"(?i)act\s+as\s+a",
    r"(?i)reveal\s+(your|the)?\s*system\s+prompt",
    r"(?i)system\s+prompt",
    r"(?i)jailbreak",
    r"(?i)dan\s+mode",
]

def sanitize_input(text: str) -> str:
    """
    Strips HTML tags and normalizes whitespace to prevent cross-site scripting
    and prompt formatting attacks.
    """
    if not text:
        return ""
    # Strip HTML tags
    clean_text = bleach.clean(text, tags=[], strip=True)
    # Remove null characters and control characters
    clean_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', clean_text)
    return clean_text.strip()

def detect_prompt_injection(text: str) -> bool:
    """
    Scans text against known prompt injection and system prompt override attempts.
    Returns True if an injection attempt is detected.
    """
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text):
            return True
    return False


def sanitize_output_confidence(output_text: str) -> str:
    """
    Output Guard: Replaces hallucinated floating point numerical percentages
    (e.g., 97.836%, 99.4%) with qualitative confidence levels.
    """
    if not output_text:
        return output_text
    
    # Matches patterns like 97.836%, 95.5%, 99.1234%
    pattern = r'\b(\d{1,3}(?:\.\d+)?)\s*%'
    
    def confidence_replacer(match):
        try:
            val = float(match.group(1))
            if val >= 85.0:
                return "High Confidence"
            elif val >= 50.0:
                return "Medium Confidence"
            else:
                return "Low Confidence"
        except ValueError:
            return "Medium Confidence"

    return re.sub(pattern, confidence_replacer, output_text)
