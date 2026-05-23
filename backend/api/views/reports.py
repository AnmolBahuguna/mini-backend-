from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from dateutil import parser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.auth import get_supabase_user
from api.serializers import ReportCreateSerializer
from api.services.supabase_client import get_report_by_id, get_reports, save_threat_report
from api.tasks.alert_dispatch import check_and_dispatch_alerts

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


def _serialize_report_row(row: dict) -> dict:
    if not row:
        return {}

    entity_type = row.get('entity_type') or 'entity'
    scam_type = row.get('scam_type') or 'Unknown'
    created_at = row.get('created_at')
    
    # Get state from location_state column
    state = row.get('location_state') or row.get('state') or row.get('district') or 'Unknown'

    return {
        'id': row.get('id') or str(uuid.uuid4()),
        'title': row.get('title') or f"{scam_type} — {entity_type.upper()}",
        'entity': row.get('entity'),
        'scamType': scam_type,
        'description': row.get('description') or '',
        'region': state,
        'severity': row.get('severity') or row.get('risk_level') or 'MEDIUM',
        'timeAgo': _format_time_ago(created_at),
        'similarCount': int(row.get('report_count') or row.get('reports_count') or 0),
    }


class SubmitReportView(APIView):
    """POST /api/reports/submit/ - Submit a new threat report"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Accept: entity, entity_type, scam_type, description, district, state, severity"""
        try:
            entity = request.data.get('entity', '').strip()
            entity_type = request.data.get('entity_type')
            scam_type = request.data.get('scam_type')
            description = request.data.get('description', '').strip()
            district = request.data.get('district')
            state = request.data.get('state')
            severity = request.data.get('severity')

            # Validate entity is not empty after stripping
            if not entity:
                return Response({'error': 'entity must not be empty'}, status=400)
            
            # Validate description is not empty after stripping
            if not description:
                return Response({'error': 'description must not be empty'}, status=400)

            required_fields = ['entity', 'entity_type', 'scam_type', 'description']
            missing_fields = [field for field in required_fields if not request.data.get(field)]

            if missing_fields:
                return Response({'error': f'Missing required fields: {", ".join(missing_fields)}'}, status=400)

            valid_types = ['url', 'phone', 'email', 'domain', 'ip']
            if entity_type not in valid_types:
                return Response({'error': f'entity_type must be one of: {", ".join(valid_types)}'}, status=400)

            valid_severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            if severity and severity not in valid_severities:
                return Response({'error': f'severity must be one of: {", ".join(valid_severities)}'}, status=400)

            report_data = {
                'entity': entity.strip(),
                'entity_type': entity_type,
                'scam_type': scam_type,
                'description': description,
                'district': district,
                'state': state,
                'severity': severity
            }

            user = get_supabase_user(request)
            if user:
                report_data['reporter_id'] = user.id

            # CRITICAL: Save report FIRST, return response, THEN enqueue task
            row = save_threat_report(report_data)
            logger.info(f"[SubmitReportView] Report saved: id={row.get('id')} entity={entity}")

            # Check alert generation without Celery delays
            alert_generated = False
            if district and state:
                try:
                    # Run synchronously for deterministic behavior in local/dev where Celery may be unavailable.
                    dispatch_result = check_and_dispatch_alerts(
                        district=district,
                        state=state,
                        scam_type=scam_type or 'Unknown',
                    )
                    alert_generated = bool((dispatch_result or {}).get('dispatched'))
                    logger.info(f"[SubmitReportView] Alert dispatch result: {dispatch_result}")
                except Exception as e:
                    logger.error(f"[SubmitReportView] Alert check failed: {e}")
                    alert_generated = False

            return Response({
                'id': row.get('id'),
                'status': 'submitted',
                'success': True,
                'report_id': row.get('id'),
                'message': 'Report submitted successfully',
                'alert_generated': alert_generated,
                'report': _serialize_report_row(row),
            }, status=201)

        except Exception as e:
            logger.error(f"[SubmitReportView] Error: {e}")
            return Response({'error': 'Internal server error'}, status=500)


class ReportsListCreateView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['state', 'district', 'scam_type']
    
    def get(self, request):
        # Apply filters from query parameters
        state = request.query_params.get('state')
        scam_type = request.query_params.get('scam_type')
        district = request.query_params.get('district')
        
        logger.info(f"[ReportsListCreateView.GET] Fetching reports: state={state} scam_type={scam_type} district={district}")
        rows = get_reports(state=state, scam_type=scam_type, district=district)
        results = [_serialize_report_row(row) for row in rows]
        return Response({'results': results, 'count': len(results)})

    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)

        user = get_supabase_user(request)
        if user:
            payload['reporter_id'] = user.id

        row = save_threat_report(payload)
        logger.info(f"[ReportsListCreateView.POST] Report saved: id={row.get('id')}")
        serialized = _serialize_report_row(row)

        district = payload.get('district')
        state = payload.get('state')
        scam_type = payload.get('scam_type') or 'Unknown'
        if district and state:
            try:
                check_and_dispatch_alerts.delay(district=district, state=state, scam_type=scam_type)
            except Exception as celery_err:
                logger.error(f"[ReportsListCreateView.POST] Celery unavailable: {celery_err}")

        return Response({
            'id': row.get('id'),
            'status': 'submitted',
            **serialized
        }, status=201)


class ReportDetailView(APIView):
    def get(self, request, id):
        row = get_report_by_id(str(id))
        if not row:
            return Response({'error': 'not_found'}, status=404)
        return Response(_serialize_report_row(row))
