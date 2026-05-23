from __future__ import annotations

import hashlib
import logging
import os
import uuid

from django.core.cache import cache
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import ThreatCheckRequestSerializer
from api.services.supabase_client import upsert_drs_score, upsert_threat_check_cache
from api.services.threat_analyzer import analyze_entity
from api.services.threat_check import check_entity
# AI enrichment with fallback for compatibility issues
from api.tasks.ai_enrichment import enrich_with_ai
from api.throttling import AnonThreatCheckThrottle, AuthThreatCheckThrottle

logger = logging.getLogger(__name__)


def _summarize_api_results(raw: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for source, detail in (raw or {}).items():
        if not isinstance(detail, dict):
            out[str(source)] = str(detail)
            continue

        if source == 'virustotal':
            mal = detail.get('malicious_engines', 0)
            total = detail.get('total_engines')
            verdict = detail.get('vt_verdict')
            if total:
                out[source] = f"{verdict} ({mal}/{total} malicious)"
            else:
                out[source] = f"{verdict} (malicious={mal})"
        elif source == 'safe_browsing':
            out[source] = str(detail.get('gsb_verdict') or ('THREAT' if detail.get('is_threat') else 'CLEAN'))
        elif source == 'phishtank':
            out[source] = str(detail.get('phishtank_verdict') or ('PHISHING' if detail.get('verified') else 'CLEAN'))
        elif source == 'ipqs':
            out[source] = f"{detail.get('verdict', 'UNKNOWN')} (fraud={detail.get('fraud_score', 0)})"
        elif source == 'abuseipdb':
            out[source] = f"{detail.get('verdict', 'UNKNOWN')} (abuse={detail.get('abuse_score', 0)})"
        elif source == 'phishing_model':
            out[source] = f"{'PHISHING' if detail.get('is_phishing') else 'CLEAN'} (confidence={detail.get('confidence', 0)}%)"
        else:
            # Generic best-effort
            verdict = detail.get('verdict') or detail.get('status') or detail.get('result')
            out[str(source)] = str(verdict) if verdict is not None else str(detail)
    return out


class ThreatCheckView(APIView):
    permission_classes = [AllowAny]  # Allow anonymous threat scanning
    throttle_classes = [AnonThreatCheckThrottle, AuthThreatCheckThrottle]

    def get(self, request):
        """Simple threat check endpoint: GET /api/threat-check/?entity=xxx&type=url"""
        entity = request.query_params.get('entity')
        entity_type = request.query_params.get('type')
        
        if not entity:
            return Response({'error': 'entity parameter is required'}, status=400)
        
        if not entity_type:
            return Response({'error': 'type parameter is required'}, status=400)
        
        entity = entity.strip()
        valid_types = ['url', 'phone', 'email', 'domain', 'ip', 'upi', 'message']
        if entity_type not in valid_types:
            return Response({'error': f'type must be one of: {", ".join(valid_types)}'}, status=400)
        
        try:
            logger.info(f"[ThreatCheckView.GET] Checking {entity_type}={entity}")
            result = check_entity(entity, entity_type)
            logger.info(f"[ThreatCheckView.GET] Result: score={result.get('drs_score')}")
            return Response(result)
        except Exception as e:
            logger.error(f"[ThreatCheckView.GET] Error: {e}")
            return Response({'error': 'Internal server error'}, status=500)

    def post(self, request):
        logger.info(
            "[ThreatCheckView.POST] Incoming entity=%s type=%s",
            request.data.get('entity') or request.data.get('value'),
            request.data.get('entity_type') or request.data.get('type'),
        )
        serializer = ThreatCheckRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entity = serializer.validated_data['entity'].strip()
        entity_type = serializer.validated_data['entity_type']
        logger.info(f"[ThreatCheckView.POST] Scan started: {entity_type}={entity}")

        cache_input = f"{entity_type}:{entity.strip().lower()}"
        cache_key = f"threat_scan:{hashlib.sha256(cache_input.encode()).hexdigest()}"
        logger.info("[ThreatCheckView.POST] Cache key: %s", cache_key)
        cache_enabled = os.getenv("THREAT_SCAN_CACHE_ENABLED", "true").lower() == "true"
        logger.info("[ThreatCheckView.POST] Cache enabled: %s", cache_enabled)
        cached = None
        if cache_enabled:
            try:
                cached = cache.get(cache_key)
            except Exception as e:
                logger.warning(f"[ThreatCheckView.POST] Cache read unavailable: {e}")
        if cached:
            cached = dict(cached)
            cached['from_cache'] = True
            cached.setdefault('cached', True)
            logger.info(f"[ThreatCheckView.POST] Cache hit for {entity}")
            return Response(cached)

        try:
            result = analyze_entity(entity, entity_type)
        except Exception as e:
            logger.error(f"[ThreatCheckView.POST] analyze_entity failed: {e}")
            return Response({'error': 'Threat analysis failed', 'detail': str(e)}, status=502)

        raw_results = result.get('api_results') or {}
        logger.info("[ThreatCheckView.POST] API raw results: %s", raw_results)
        result['api_results_raw'] = raw_results
        result['api_results'] = _summarize_api_results(raw_results) if isinstance(raw_results, dict) else {}

        # Persist DRS snapshot to Supabase
        try:
            upsert_drs_score(
                entity=entity,
                entity_type=entity_type,
                score=float(result['drs_score']),
                risk_level=str(result['risk_level']),
                scam_type=str(result.get('scam_type') or 'Unknown'),
                report_count=int(result.get('reports_count') or 0),
            )
            logger.info(f"[ThreatCheckView.POST] DRS saved: {entity} score={result['drs_score']}")
        except Exception as e:
            logger.error(f"[ThreatCheckView.POST] DRS save failed: {e}")

        # Create analysis id for async enrichment + frontend polling
        analysis_id = str(uuid.uuid4())
        result['id'] = analysis_id
        result['from_cache'] = False
        result['cached'] = False
        result['status'] = 'completed'

        try:
            upsert_threat_check_cache(
                analysis_id=analysis_id,
                entity=entity,
                ai_summary={
                    'input_type': entity_type,
                    'input_value': entity,
                    'input_hash': hashlib.md5(entity.encode()).hexdigest(),
                    'status': 'completed',
                    'summary': result.get('ai_summary', '')
                }
            )
        except Exception as e:
            logger.error(f"[ThreatCheckView.POST] threat_check_cache save failed: {e}")

        # Cache whole response for fast replay (best effort when Redis is unavailable)
        if cache_enabled:
            try:
                cache.set(cache_key, result, timeout=3600)
                cache.set(f"threat:{analysis_id}", result, timeout=600)
            except Exception as e:
                logger.warning(f"[ThreatCheckView.POST] Cache write unavailable: {e}")

        # Only trigger AI enrichment if not in demo mode
        if not result.get('demo'):
            try:
                # AI enrichment with fallback for compatibility issues
                enrich_with_ai.delay(analysis_id, entity, entity_type, result['drs_score'], raw_results)
                logger.info(f"[ThreatCheckView.POST] Enqueued AI enrichment for {analysis_id}")
            except Exception as e:
                logger.error(f"[ThreatCheckView.POST] Celery enqueue failed: {e}")

        logger.info(f"[ThreatCheckView.POST] Scan complete: id={analysis_id} score={result.get('drs_score')}")
        return Response(result, status=201)


class ThreatCheckDetailView(APIView):
    """Frontend polling endpoint: GET /api/threat-check/<id>/"""

    def get(self, request, id):
        try:
            result = cache.get(f"threat:{id}")
            if result:
                if result.get('ai_summary'):
                    result = dict(result)
                    result['status'] = 'completed'
                return Response(result)
            return Response({'id': str(id), 'status': 'pending'})
        except Exception as e:
            logger.error(f"[ThreatCheckDetailView.GET] Error: {e}")
            return Response({'id': str(id), 'status': 'pending'})


class EnrichmentView(APIView):
    """AI Enrichment polling endpoint: GET /api/threat-check/<id>/enrichment/"""
    
    def get(self, request, id):
        try:
            # Check for enrichment in threat cache first
            threat_result = cache.get(f"threat:{id}")
            if threat_result and threat_result.get('ai_summary'):
                return Response({
                    'ready': True,
                    'status': 'completed',
                    'enrichment_status': 'completed',
                    'ai_summary': threat_result['ai_summary'],
                    'scam_type': threat_result.get('scam_type', 'Unknown'),
                    'warning': threat_result.get('warning') or 'Potentially harmful content detected. Avoid engaging and report if needed.',
                    'confidence': threat_result.get('confidence_score', 0),
                    'report_to': threat_result.get('report_to') or 'Cyber Crime Helpline 1930',
                    'ai_recommendations': threat_result.get('ai_recommendations'),
                    'threat_indicators': threat_result.get('threat_indicators'),
                    'confidence_score': threat_result.get('confidence_score'),
                })

            # Check separate enrichment cache
            enrichment = cache.get(f"enrichment:{id}")
            if enrichment and enrichment.get('status') == 'completed':
                return Response({
                    'ready': True,
                    'status': 'completed',
                    'enrichment_status': 'completed',
                    'ai_summary': enrichment.get('ai_summary'),
                    'scam_type': enrichment.get('scam_type', 'Unknown'),
                    'warning': enrichment.get('warning') or 'Potentially harmful content detected. Avoid engaging and report if needed.',
                    'confidence': enrichment.get('confidence_score', 0),
                    'report_to': enrichment.get('report_to') or 'Cyber Crime Helpline 1930',
                    'ai_recommendations': enrichment.get('ai_recommendations'),
                    'threat_indicators': enrichment.get('threat_indicators'),
                    'confidence_score': enrichment.get('confidence_score'),
                    'model_used': enrichment.get('model_used'),
                    'processing_time_ms': enrichment.get('processing_time_ms'),
                })
            elif enrichment and enrichment.get('status') == 'failed':
                return Response({
                    'ready': True,
                    'error': enrichment.get('error'),
                    'status': 'failed',
                    'enrichment_status': 'failed',
                    'ai_summary': None,
                    'scam_type': 'Unknown',
                    'warning': 'AI enrichment failed. Treat this item with caution.',
                    'confidence': 0,
                    'report_to': 'Cyber Crime Helpline 1930',
                })

            return Response({
                'ready': False,
                'status': 'pending',
                'enrichment_status': 'pending',
                'ai_summary': None,
                'scam_type': 'Unknown',
                'warning': None,
                'confidence': 0,
                'report_to': None,
            })
        except Exception as e:
            logger.error(f"[EnrichmentView.GET] Error: {e}")
            return Response({
                'ready': False,
                'status': 'pending',
                'enrichment_status': 'pending',
                'ai_summary': None,
                'scam_type': 'Unknown',
                'warning': None,
                'confidence': 0,
                'report_to': None,
            })
