from __future__ import annotations

import logging
from datetime import datetime, timezone

from dateutil import parser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.supabase_client import get_active_alerts

logger = logging.getLogger(__name__)


def _format_time_ago(created_at: str | None) -> str:
    if not created_at:
        return 'Just now'
    try:
        dt = parser.parse(created_at)
        now = datetime.now(timezone.utc)
        delta = now - dt
        minutes = int(delta.total_seconds() // 60)
        if minutes < 1:
            return 'Just now'
        if minutes < 60:
            return f"{minutes}m ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours}h ago"
        days = hours // 24
        return f"{days}d ago"
    except Exception:
        return 'Just now'


def _serialize_alert(row: dict) -> dict:
    if not row:
        return {}

    title = row.get('title') or 'Alert'
    description = row.get('description') or ''
    
    # Parse surge alert metadata from title/description if not in database fields
    # Format: "Surge Alert: {scam_type} in {state}"
    # Description: "{count} reports in 24h for {scam_type} in {state}"
    state = row.get('location_state') or row.get('state')
    scam_type = row.get('scam_type')
    affected_count = row.get('affected_count') or row.get('count') or row.get('report_count')
    
    # If this is a surge alert and fields are missing, parse from title/description
    if row.get('alert_type') == 'surge' or 'surge alert:' in title.lower():
        if not state or not scam_type or not affected_count:
            import re
            # Parse "Surge Alert: Digital Arrest in Delhi"
            title_match = re.search(r'Surge Alert:\s*(.+?)\s+in\s+(.+?)$', title, re.IGNORECASE)
            if title_match:
                scam_type = scam_type or title_match.group(1).strip()
                state = state or title_match.group(2).strip()
            
            # Parse "64 reports in 24h for Digital Arrest in Delhi"
            desc_match = re.search(r'(\d+)\s+reports\s+in\s+24h', description)
            if desc_match and not affected_count:
                affected_count = int(desc_match.group(1))
    
    # Set defaults for missing fields
    state = state or 'Unknown'
    scam_type = scam_type or 'Threat'
    affected_count = int(affected_count) if affected_count else 0
    
    # Extract district - for surge alerts, use state as region
    district = row.get('district') or row.get('city')
    if row.get('alert_type') == 'surge' or 'surge alert:' in title.lower():
        region = state  # For surge alerts, show the state as the region
    else:
        region = district if district else state
    
    # Extract severity and normalize it
    severity = (row.get('severity') or 'MEDIUM').upper()
    if severity == 'CRITICAL' or severity == 'WARNING':
        severity = 'HIGH'
    elif severity not in ['HIGH', 'MEDIUM', 'LOW']:
        severity = 'MEDIUM'

    return {
        'id': row.get('id') or row.get('uuid') or row.get('alert_id'),
        'title': title,
        'region': region,
        'severity': severity,
        'time': _format_time_ago(row.get('created_at')),
        'description': description or f'Alert for {scam_type} in {state}',
        'affectedCount': affected_count,
        'scamType': scam_type,
        'state': state,
        'alert_type': row.get('alert_type') or (
            'surge'
            if 'surge' in f"{title} {description}".lower()
            else 'general'
        ),
    }


class AlertsView(APIView):
    def get(self, request):
        """GET /api/alerts/ - Query alerts table: is_active=true, order by created_at desc, limit 20"""
        state = request.query_params.get('state')
        scam_type = request.query_params.get('scam_type')
        
        try:
            alerts = get_active_alerts(state=state, scam_type=scam_type)
            serialized = [_serialize_alert(row) for row in alerts][:20]
            return Response({'results': serialized, 'count': len(serialized)})
        except Exception as e:
            logger.error(f"Error in alerts GET: {e}", exc_info=True)
            return Response({'error': 'Internal server error'}, status=500)
