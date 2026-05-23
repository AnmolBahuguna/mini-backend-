from __future__ import annotations

import logging

from celery import shared_task
from django.core.cache import cache

from api.services.gemini import analyze_threat_gemini
from api.services.openrouter import analyze_threat_with_ai
from api.services.supabase_client import upsert_threat_check_cache

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def enrich_with_ai(self, analysis_id: str, entity: str, entity_type: str, drs_score: float, api_results: dict):
    try:
        logger.info(
            "[AI Enrichment] Starting analysis_id=%s entity=%s type=%s drs=%s",
            analysis_id, entity, entity_type, drs_score
        )
        try:
            summary = analyze_threat_with_ai(entity, entity_type, drs_score, api_results)
        except Exception:
            summary = analyze_threat_gemini(entity, entity_type, drs_score, api_results)

        # Frontend displays ai_summary as plain text.
        ai_text = summary.get('summary') if isinstance(summary, dict) else str(summary)

        cache.set(f'ai_summary:{analysis_id}', ai_text, timeout=600)

        existing = cache.get(f'threat:{analysis_id}') or {}
        if isinstance(existing, dict):
            merged = {**existing, 'ai_summary': ai_text, 'ai_summary_raw': summary, 'status': 'completed'}
        else:
            merged = {'ai_summary': ai_text, 'ai_summary_raw': summary, 'status': 'completed'}
        cache.set(f'threat:{analysis_id}', merged, timeout=600)
        cache.set(
            f'enrichment:{analysis_id}',
            {
                'status': 'completed',
                'ai_summary': ai_text,
                'scam_type': merged.get('scam_type', 'Unknown'),
                'warning': merged.get('warning'),
                'ai_recommendations': merged.get('ai_recommendations'),
                'threat_indicators': merged.get('threat_indicators'),
                'confidence_score': merged.get('confidence_score'),
                'model_used': (summary or {}).get('model_used') if isinstance(summary, dict) else None,
            },
            timeout=600,
        )

        try:
            upsert_threat_check_cache(analysis_id, entity, summary if isinstance(summary, dict) else {'summary': ai_text})
        except Exception as e:
            logger.warning(f"Failed to persist AI enrichment to database: {e}")

        logger.info("[AI Enrichment] Completed analysis_id=%s", analysis_id)
        return summary
    except Exception as e:
        logger.error(f"AI enrichment failed for {analysis_id}: {e}")
        existing = cache.get(f'threat:{analysis_id}') or {}
        if isinstance(existing, dict):
            cache.set(f'threat:{analysis_id}', {**existing, 'status': 'failed', 'error': str(e)}, timeout=600)
        else:
            cache.set(f'threat:{analysis_id}', {'status': 'failed', 'error': str(e)}, timeout=600)
        cache.set(f'enrichment:{analysis_id}', {'status': 'failed', 'error': str(e)}, timeout=600)
        raise
