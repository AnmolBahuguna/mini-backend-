from __future__ import annotations

import json
import os
import logging

logger = logging.getLogger(__name__)

# Try to import google.generativeai, but handle gracefully if it fails
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    logger.info("Google Generative AI successfully imported")
except Exception as e:
    GEMINI_AVAILABLE = False
    logger.warning(f"Google Generative AI not available: {e}")
    logger.warning("Using fallback analysis mode")


def analyze_threat_gemini(entity: str, entity_type: str, drs_score: float, api_results: dict) -> dict:
    """
    Analyze threat using Google Gemini API, with fallback for compatibility issues
    """
    api_key = os.getenv('GEMINI_API_KEY', '')
    
    # Check if Gemini is available and configured
    if not GEMINI_AVAILABLE:
        logger.warning(f"Gemini not available due to compatibility issues, using fallback analysis for {entity}")
        return _fallback_analysis(entity, entity_type, drs_score, api_results)
    
    if not api_key:
        logger.warning("Gemini API key not configured")
        return {'summary': 'Gemini not configured', 'scam_type': 'Unknown', 'confidence': 0}

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.getenv('GEMINI_MODEL', 'gemini-1.5-flash'))

        prompt = (
            f"Analyze this {entity_type} for cybersecurity threats: {entity}. "
            f"DRS Score: {drs_score}/10. API Results: {json.dumps(api_results)}. "
            "Return only JSON: {\"summary\": str, \"scam_type\": str, \"confidence\": int}"
        )

        response = model.generate_content(prompt)
        content = (response.text or '').replace('```json', '').replace('```', '').strip()
        result = json.loads(content)
        logger.info(f"Gemini analysis completed for {entity}")
        return result
    except Exception as e:
        logger.error(f"Gemini analysis failed for {entity}: {e}")
        return _fallback_analysis(entity, entity_type, drs_score, api_results)


def gemini_chat(messages: list[dict], max_tokens: int = 200) -> str:
    api_key = os.getenv('GEMINI_API_KEY', '')

    if not GEMINI_AVAILABLE:
        raise RuntimeError('Gemini not available')

    if not api_key:
        raise RuntimeError('GEMINI_API_KEY not configured')

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv('GEMINI_MODEL', 'gemini-1.5-flash'))

    prompt = _format_chat_messages(messages)
    response = model.generate_content(prompt)
    content = (response.text or '').strip()
    if not content:
        raise ValueError('Gemini returned empty content')
    return content[: max_tokens * 4]


def _format_chat_messages(messages: list[dict]) -> str:
    lines: list[str] = []
    for message in messages or []:
        role = message.get('role')
        content = message.get('content')
        if not isinstance(content, str):
            continue
        label = 'System'
        if role == 'user':
            label = 'User'
        elif role == 'assistant':
            label = 'Assistant'
        lines.append(f"{label}: {content}")
    return "\n".join(lines)

def _fallback_analysis(entity: str, entity_type: str, drs_score: float, api_results: dict) -> dict:
    """
    Fallback analysis when Gemini is not available
    """
    # Basic rule-based analysis based on DRS score and API results
    confidence = min(int(drs_score * 10), 100)
    
    # Determine scam type based on API results and entity type
    scam_type = "Unknown"
    
    if entity_type.lower() == "url":
        if drs_score >= 7:
            scam_type = "Malicious Website"
        elif drs_score >= 4:
            scam_type = "Suspicious Website"
        else:
            scam_type = "Legitimate"
    elif entity_type.lower() == "email":
        if drs_score >= 7:
            scam_type = "Phishing Email"
        elif drs_score >= 4:
            scam_type = "Spam Email"
        else:
            scam_type = "Legitimate"
    elif entity_type.lower() == "ip":
        if drs_score >= 7:
            scam_type = "Malicious IP"
        elif drs_score >= 4:
            scam_type = "Suspicious IP"
        else:
            scam_type = "Clean"
    
    # Generate summary based on analysis
    if drs_score >= 7:
        summary = f"High-risk {entity_type} detected. Multiple threat indicators found."
    elif drs_score >= 4:
        summary = f"Moderate risk {entity_type}. Some suspicious characteristics detected."
    else:
        summary = f"Low risk {entity_type}. No significant threat indicators found."
    
    # Add API results context if available
    if api_results:
        threat_count = sum(1 for result in api_results.values() if isinstance(result, dict) and result.get('threat_detected'))
        if threat_count > 0:
            summary += f" {threat_count} threat detection service(s) flagged this entity."
    
    return {
        'summary': summary,
        'scam_type': scam_type,
        'confidence': confidence,
        'fallback_mode': True
    }
