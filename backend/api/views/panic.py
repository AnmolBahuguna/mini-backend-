from __future__ import annotations

import logging
import uuid

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from api.auth import get_supabase_user
from api.serializers import PanicRequestSerializer
from api.services.supabase_client import supabase
from api.services.twilio_sms import send_panic_sms

logger = logging.getLogger(__name__)

def _normalize_contact(number: str) -> str | None:
    if not number:
        return None
    digits = ''.join(ch for ch in str(number) if ch.isdigit())
    if not digits:
        return None
    if digits.startswith('91') and len(digits) == 12:
        return f"+{digits}"
    if digits.startswith('0') and len(digits) == 11:
        return f"+91{digits[1:]}"
    if len(digits) == 10:
        return f"+91{digits}"
    return f"+{digits}"


class PanicView(APIView):
    permission_classes = [AllowAny]  # Emergency endpoint - anyone can use
    
    def post(self, request):
        serializer = PanicRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        location = payload.get('location') or {}
        lat = payload.get('lat')
        lng = payload.get('lng')
        if isinstance(location, dict):
            if lat is None:
                lat = location.get('latitude') or location.get('lat')
            if lng is None:
                lng = location.get('longitude') or location.get('lng')
        
        # Validate latitude and longitude
        if lat is not None:
            try:
                lat = float(lat)
                if not (-90 <= lat <= 90):
                    return Response({'error': 'Invalid latitude: must be between -90 and 90'}, status=400)
            except (ValueError, TypeError):
                return Response({'error': 'Invalid latitude: must be a number'}, status=400)
        
        if lng is not None:
            try:
                lng = float(lng)
                if not (-180 <= lng <= 180):
                    return Response({'error': 'Invalid longitude: must be between -180 and 180'}, status=400)
            except (ValueError, TypeError):
                return Response({'error': 'Invalid longitude: must be a number'}, status=400)

        contacts_raw = payload.get('contacts') or payload.get('emergency_contacts') or []
        contacts = [_normalize_contact(contact) for contact in contacts_raw]
        contacts = [contact for contact in contacts if contact]
        contacts = list(dict.fromkeys(contacts))[:3]

        user_name = payload.get('name') or 'DHIP User'
        user_message = (payload.get('message') or '').strip()

        maps_link = f'https://maps.google.com/?q={lat},{lng}' if (lat is not None and lng is not None) else 'Location not shared'
        message = (
            'EMERGENCY ALERT from DHIP\n'
            f'{user_name} needs immediate help!\n'
            f'Location: {maps_link}\n'
            f'Time: {timezone.now().strftime("%d %b %Y, %I:%M %p")}\n'
            'Call them immediately or contact police: 100'
        )
        if user_message:
            message += f"\nMessage: {user_message[:240]}"

        results = send_panic_sms(message, contacts)
        sms_sent = sum(1 for result in (results or []) if result.get('status') == 'sent')
        # In environments where Twilio blocks destination (trial restrictions), count attempted deliveries.
        attempted = len([result for result in (results or []) if result.get('to')])
        if sms_sent == 0:
            logger.warning("[PanicView] Twilio SMS sending failed or returned empty.")

        user = get_supabase_user(request)
        user_id = user.id if user else None

        if supabase and user_id:
            try:
                supabase.table('panic_events').insert({
                    'user_id': user_id,
                    'lat': lat,
                    'lng': lng,
                    'message': message,
                    'contacts_notified': contacts,
                    'status': 'sent'
                }).execute()
            except Exception as e:
                logger.error(f"[PanicView] Failed to save panic event to DB: {e}")
        else:
            logger.warning("[PanicView] User unauthenticated or Supabase unavailable, skipped DB save.")

        return Response({
            'id': str(uuid.uuid4()) if not user_id else f"panic_{user_id}",
            'status': 'sent' if sms_sent > 0 else 'saved_locally',
            'sms_sent': sms_sent,
            'sms_attempted': attempted,
        })
