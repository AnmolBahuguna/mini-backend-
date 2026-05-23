from __future__ import annotations

import os

from twilio.rest import Client


def _sanitize_e164(number: str) -> str:
    if not number:
        return ''
    cleaned = ''.join(ch for ch in str(number).strip() if ch.isdigit() or ch == '+')
    if cleaned.startswith('+'):
        return f"+{''.join(ch for ch in cleaned if ch.isdigit())}"
    digits = ''.join(ch for ch in cleaned if ch.isdigit())
    return f"+{digits}" if digits else ''


def send_panic_sms(message: str, to_numbers: list[str]) -> list[dict]:
    sid = os.getenv('TWILIO_ACCOUNT_SID', '')
    token = os.getenv('TWILIO_AUTH_TOKEN', '')
    from_number = os.getenv('TWILIO_FROM_NUMBER', '') or os.getenv('TWILIO_PHONE_NUMBER', '')
    from_number = _sanitize_e164(from_number)

    if not sid or not token or not from_number:
        return [{'to': n, 'status': 'failed', 'error': 'Twilio not configured'} for n in to_numbers]

    client = Client(sid, token)
    results: list[dict] = []

    for number in (to_numbers or [])[:3]:
        to_number = _sanitize_e164(number)
        if not to_number:
            results.append({'to': number, 'status': 'failed', 'error': 'Invalid phone number'})
            continue
        try:
            msg = client.messages.create(body=message, from_=from_number, to=to_number)
            results.append({'to': to_number, 'status': 'sent', 'sid': msg.sid})
        except Exception as exc:
            results.append({'to': to_number or number, 'status': 'failed', 'error': str(exc)})

    return results
