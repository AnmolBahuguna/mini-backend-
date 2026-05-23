from __future__ import annotations

import logging
import re

from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from api.serializers import SupportChatRequestSerializer
from api.services.openrouter import openrouter_chat
from api.services.gemini import gemini_chat

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a cybersecurity safety advisor for Indian users. Be calm, practical, and non-judgmental. NEVER victim-blame.
Goals:
- Identify likely threat type (phishing, UPI fraud, OTP scam, fake call, malware, account takeover, social engineering).
- Provide clear next steps: stop interaction, do NOT share OTP/UPI PIN, freeze cards/bank, reset passwords, enable 2FA.
- Ask 1-2 short clarifying questions if needed.
- Keep responses under 120 words and use simple Hindi-friendly English.
Always end with relevant helplines:
- Cyber Crime Helpline: 1930
- Police: 100
- NCW: 7827-170-170 (if women safety concerns)
"""

RESOURCES = [
    {'name': 'Cyber Crime Helpline', 'contact': '1930', 'number': '1930'},
    {'name': 'Cybercrime Portal', 'contact': 'cybercrime.gov.in', 'number': 'cybercrime.gov.in'},
    {'name': 'NCW', 'contact': '7827-170-170', 'number': '7827-170-170'},
    {'name': 'Police', 'contact': '100', 'number': '100'},
]

RESOURCES_LINE = "Resources: Cyber Crime 1930 | cybercrime.gov.in | Police 100 | NCW 7827-170-170"


def _build_messages(message: str, history: list[dict]) -> list[dict]:
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    for item in (history or [])[-8:]:
        role = item.get('role')
        content = item.get('content')
        if role in ('user', 'assistant') and isinstance(content, str):
            messages.append({'role': role, 'content': content[:2000]})
    messages.append({'role': 'user', 'content': message[:2000]})
    return messages


def _append_resources(reply: str) -> str:
    if not isinstance(reply, str):
        reply = str(reply)
    if RESOURCES_LINE in reply:
        return reply
    if reply and not reply.endswith('\n'):
        reply += '\n\n'
    return f"{reply}{RESOURCES_LINE}"

def _cyber_fallback_reply(message: str) -> str:
    text = (message or '').lower()
    text = re.sub(r'\s+', ' ', text).strip()

    def has_any(words: tuple[str, ...]) -> bool:
        return any(word in text for word in words)

    scam_type = "Possible social engineering"
    if has_any(("otp", "upi", "pin", "vpa", "kyc")):
        scam_type = "OTP/UPI scam"
    elif has_any(("link", "login", "password", "verify", "bank", "account", "refund", "update")):
        scam_type = "Phishing"
    elif has_any(("investment", "crypto", "trading", "returns", "profit")):
        scam_type = "Investment scam"
    elif has_any(("job", "work from home", "part-time", "salary", "internship")):
        scam_type = "Job scam"
    elif has_any(("parcel", "courier", "customs", "fedex", "dhl")):
        scam_type = "Courier/parcel scam"
    elif has_any(("police", "cbi", "ed", "court", "legal")):
        scam_type = "Impersonation scam"
    elif has_any(("whatsapp", "telegram", "instagram", "facebook", "dm")):
        scam_type = "Social media scam"

    return (
        f"This looks like {scam_type}. Please stop engaging now. "
        "Do not share OTP/UPI PIN or click unknown links. "
        "If money was sent, call your bank and 1930 immediately. "
        "Change passwords and enable 2FA. Did you share any OTP or make a payment?"
    )


class ChatbotView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SupportChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data['message']
        history = serializer.validated_data.get('history') or []
        messages = _build_messages(message, history)

        try:
            reply = openrouter_chat(messages)
        except Exception as exc:
            logger.warning("OpenRouter chat failed: %s", exc)
            try:
                reply = gemini_chat(messages)
            except Exception as gemini_exc:
                logger.warning("Gemini chat failed: %s", gemini_exc)
                reply = _cyber_fallback_reply(message)

        reply = _append_resources(reply)
        return Response({'reply': reply, 'response': reply, 'resources': RESOURCES})
