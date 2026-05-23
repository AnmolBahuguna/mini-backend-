from __future__ import annotations
import logging
import requests
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from decouple import config

logger = logging.getLogger(__name__)

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        status_code = 200
        response_data = {"status": "ok", "db": "ok", "redis": "ok", "supabase": "ok"}
        
        # Check if we're in demo mode
        DEMO_MODE = config('DEMO_MODE', default='false').lower() == 'true'
        
        if DEMO_MODE:
            response_data["supabase"] = "demo"
            response_data["db"] = "demo"
        else:
            try:
                from api.services.supabase_client import supabase as sb
                if sb:
                    sb.table('threat_reports').select('id').limit(1).execute()
                else:
                    response_data["supabase"] = "error"
                    response_data["db"] = "error"
                    response_data["status"] = "error"
                    status_code = 503
            except Exception:
                response_data["supabase"] = "error"
                response_data["db"] = "error"
                response_data["status"] = "error"
                status_code = 503

        try:
            from django.core.cache import cache
            cache.set('_health_ping', 1, timeout=5)
            if cache.get('_health_ping') != 1:
                response_data["redis"] = "error"
                response_data["status"] = "error"
                status_code = 503
        except Exception:
            response_data["redis"] = "error"
            response_data["status"] = "error"
            status_code = 503

        return Response(response_data, status=status_code)


class AuthHealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        demo_mode = config('DEMO_MODE', default='false').lower() == 'true'
        supabase_url = config('SUPABASE_URL', default='').strip()
        supabase_key = (config('SUPABASE_ANON_KEY', default='') or config('SUPABASE_SERVICE_KEY', default='')).strip()

        configured = bool(supabase_url and supabase_key)
        reachable = False
        rate_limited = False
        status_text = 'ok'
        status_code = 200
        detail = None

        if demo_mode:
            status_text = 'demo'
            detail = 'Auth provider checks are bypassed because DEMO_MODE=true'
        elif not configured:
            status_text = 'error'
            status_code = 503
            detail = 'SUPABASE_URL and auth key must be configured'
        else:
            probe_url = f"{supabase_url.rstrip('/')}/auth/v1/settings"
            try:
                resp = requests.get(
                    probe_url,
                    headers={'apikey': supabase_key},
                    timeout=8,
                )
                if resp.status_code == 429:
                    rate_limited = True
                    reachable = True
                    status_text = 'degraded'
                    status_code = 503
                    detail = 'Auth provider reachable but currently rate-limited'
                elif resp.status_code >= 500:
                    status_text = 'error'
                    status_code = 503
                    detail = f'Auth provider returned {resp.status_code}'
                else:
                    reachable = True
            except requests.RequestException:
                status_text = 'error'
                status_code = 503
                detail = 'Auth provider is unreachable'

        return Response(
            {
                'status': status_text,
                'configured': configured,
                'reachable': reachable,
                'rate_limited': rate_limited,
                'demo_mode': demo_mode,
                'detail': detail,
            },
            status=status_code,
        )
