from __future__ import annotations

import json
import os

import requests
from api.services.gemini import analyze_threat_gemini

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

def openrouter_chat(messages: list[dict], max_tokens: int = 200) -> str:
    if not OPENROUTER_API_KEY:
        raise RuntimeError('OPENROUTER_API_KEY not configured')

    response = requests.post(
        BASE_URL,
        headers={
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://dhip.vercel.app',
            'X-Title': 'DHIP Safety Platform',
        },
        json={
            'model': os.getenv('OPENROUTER_MODEL', 'openrouter/free'),
            'messages': messages,
            'max_tokens': max_tokens,
            'temperature': 0.4,
        },
        timeout=20,
    )
    response.raise_for_status()
    content = response.json().get('choices', [{}])[0].get('message', {}).get('content')
    if not content:
        raise ValueError('OpenRouter returned empty content')
    return content


def analyze_threat_with_ai(entity: str, entity_type: str, drs_score: float, api_results: dict) -> dict:
    if not OPENROUTER_API_KEY:
        return {
            'summary': 'AI not configured on server.',
            'scam_type': 'Unknown',
            'warning': 'Configure OPENROUTER_API_KEY for AI summaries.',
            'confidence': 0,
            'report_to': 'Cyber Helpline 1930',
        }

    prompt = f"""
You are a cybersecurity expert helping Indian users stay safe online.
Analyze this {entity_type}: {entity}
DRS Score: {drs_score}/10
API Results: {json.dumps(api_results, indent=2)}

Respond ONLY in JSON with this exact schema:
{{
  \"summary\": \"2-sentence plain English explanation\",
  \"scam_type\": \"Category name (Phishing/Vishing/UPI Fraud/etc)\",
  \"warning\": \"What user should do\",
  \"confidence\": 0-100,
  \"report_to\": \"Cyber Helpline 1930 / NCW 7827-170-170\"
}}
""".strip()

    try:
        response = requests.post(
            BASE_URL,
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://dhip.vercel.app',
                'X-Title': 'DHIP Cyber Safety Platform',
            },
            json={
                'model': os.getenv('OPENROUTER_MODEL', 'openrouter/free'),
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 300,
                'temperature': 0.3,
            },
            timeout=20,
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        content = content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        return {
            'summary': f'This {entity_type} may pose a risk. DRS score: {drs_score}/10.',
            'scam_type': 'Unknown',
            'warning': 'Exercise caution. Do not share personal or financial information.',
            'confidence': int(drs_score * 10),
            'report_to': 'Cyber Helpline 1930',
            'ai_error': str(e),
        }


def women_safety_chatbot(user_message: str, conversation_history: list) -> str:
    if not OPENROUTER_API_KEY:
        gemini_reply = _women_safety_gemini_reply(user_message, conversation_history)
        if gemini_reply:
            return gemini_reply
        return _women_safety_default_reply()

    system_prompt = (
        "You are a compassionate digital safety counselor for DHIP India. "
        "Rules: Never blame the victim. Always validate feelings first. "
        "Provide actionable next steps. Mention NCW helpline 7827-170-170 when relevant. "
        "Mention Cyber Helpline 1930 for financial fraud. Keep responses under 100 words."
    )

    messages = [{'role': 'system', 'content': system_prompt}]
    for item in (conversation_history or [])[-8:]:
        role = item.get('role')
        content = item.get('content')
        if role in ('user', 'assistant') and isinstance(content, str):
            messages.append({'role': role, 'content': content[:2000]})
    messages.append({'role': 'user', 'content': user_message[:2000]})

    try:
        response = requests.post(
            BASE_URL,
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'model': os.getenv('OPENROUTER_MODEL', 'openrouter/free'),
                'messages': messages,
                'max_tokens': 200,
                'temperature': 0.4,
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception:
        gemini_reply = _women_safety_gemini_reply(user_message, conversation_history)
        if gemini_reply:
            return gemini_reply
        return _women_safety_default_reply()


def _women_safety_default_reply() -> str:
    return (
        "I am sorry this is happening to you. You are not at fault. If you are in immediate danger call 100. "
        "For cyber fraud call 1930 and for women support contact NCW at 7827-170-170."
    )


def _women_safety_gemini_reply(user_message: str, conversation_history: list) -> str | None:
    try:
        result = analyze_threat_gemini(
            entity=user_message,
            entity_type='message',
            drs_score=5.0,
            api_results={'history': (conversation_history or [])[-5:]},
        )
        summary = result.get('summary') if isinstance(result, dict) else None
        if summary:
            return (
                f"{summary}\n\nResources: NCW 7827-170-170 | Cyber Crime 1930 | Police 100"
            )
    except Exception:
        return None
    return None
