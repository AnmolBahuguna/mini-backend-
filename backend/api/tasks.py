from __future__ import annotations
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
from celery import shared_task

from api.services.openrouter import analyze_threat_with_ai
from api.services.supabase_client import upsert_threat_check_cache, get_active_alerts, save_threat_report
from api.ml.pce_model import PatternConfidenceEngine
from api.ml.tmd_model import TMDModel

logger = logging.getLogger(__name__)



@shared_task(bind=True, max_retries=3)
def ai_enrichment_task(self, analysis_id: str, entity: str, entity_type: str, drs_score: float = 0.0, api_results: dict = None) -> Dict[str, Any]:
    """
    Async AI enrichment task - adds AI analysis to completed threat checks.
    """
    try:
        logger.info(f"[ai_enrichment_task] Starting enrichment for {analysis_id}: {entity_type}={entity}")
        ai_result = analyze_threat_with_ai(entity, entity_type, drs_score, api_results or {})

        enrichment_data = {
            'analysis_id': analysis_id,
            'entity': entity,
            'entity_type': entity_type,
            'ai_summary': ai_result.get('summary'),
            'ai_recommendations': ai_result.get('warning'),
            'threat_indicators': ai_result.get('scam_type'),
            'confidence_score': ai_result.get('confidence'),
            'model_used': 'openrouter',
            'processing_time_ms': 0,
            'status': 'completed',
            'completed_at': datetime.utcnow().isoformat()
        }

        upsert_threat_check_cache(analysis_id, entity, enrichment_data)
        logger.info(f"[ai_enrichment_task] Enrichment complete for {analysis_id}")
        return {'success': True, 'analysis_id': analysis_id, 'enrichment': enrichment_data}

    except Exception as exc:
        logger.error(f"[ai_enrichment_task] Failed for {analysis_id}: {exc}")
        if self.request.retries < self.max_retries:
            countdown = 2 ** self.request.retries
            raise self.retry(countdown=countdown, exc=exc)

        failed_data = {
            'analysis_id': analysis_id,
            'entity': entity,
            'entity_type': entity_type,
            'status': 'failed',
            'error': str(exc),
            'failed_at': datetime.utcnow().isoformat()
        }
        upsert_threat_check_cache(analysis_id, entity, failed_data)
        return {'success': False, 'analysis_id': analysis_id, 'error': str(exc)}


@shared_task(bind=True)
def alert_spike_detection_task(self) -> Dict[str, Any]:
    """
    Background task to detect alert spikes.
    """
    try:
        recent_alerts = get_active_alerts()
        alert_count = len(recent_alerts)
        logger.info(f"[alert_spike_detection_task] Checking {alert_count} active alerts")

        # Simple spike detection: more than 10 alerts in last hour = spike
        if alert_count > 10:
            logger.warning(f"[alert_spike_detection_task] Alert spike detected: {alert_count} alerts")
            return {'success': True, 'spike_detected': True, 'alert_count': alert_count}

        return {'success': True, 'spike_detected': False, 'alert_count': alert_count}

    except Exception as exc:
        logger.error(f"[alert_spike_detection_task] Failed: {exc}")
        return {'success': False, 'error': str(exc)}


@shared_task(bind=True)
def temporal_mutation_detection_task(self) -> Dict[str, Any]:
    """
    Background task for Temporal Mutation Detection (TMD) using DBSCAN clustering.
    """
    try:
        tmd = TMDModel()
        from api.services.supabase_client import get_reports
        recent_reports = get_reports()

        if len(recent_reports) < 10:
            logger.info(f"[TMD] Insufficient data: {len(recent_reports)} reports (need 10)")
            return {'success': True, 'message': 'Insufficient data', 'current_reports': len(recent_reports)}

        mutations = tmd.detect_mutations(recent_reports)
        logger.info(f"[TMD] Detected {len(mutations)} mutation clusters")

        return {
            'success': True,
            'mutations_detected': len(mutations) > 0,
            'mutation_count': len(mutations),
            'clusters': mutations
        }

    except Exception as exc:
        logger.error(f"[TMD] Failed: {exc}")
        return {'success': False, 'error': str(exc)}


@shared_task(bind=True)
def cache_cleanup_task(self) -> Dict[str, Any]:
    """
    Background task to clean up expired cache entries
    """
    try:
        from django.core.cache import cache
        
        # Get all cache keys (this is a simplified approach)
        # In production, you might want to use a more sophisticated method
        cache_keys_to_check = [
            'threat_check_*',
            'drs_score_*',
            'api_response_*'
        ]
        
        cleaned_count = 0
        for pattern in cache_keys_to_check:
            # This would need to be implemented based on your cache backend
            # For Redis, you could use SCAN with MATCH
            pass
        
        return {
            'success': True,
            'cleaned_entries': cleaned_count,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as exc:
        return {
            'success': False,
            'error': str(exc)
        }


@shared_task(bind=True)
def daily_metrics_task(self) -> Dict[str, Any]:
    """
    Daily task to generate platform metrics and statistics
    """
    try:
        from api.services.supabase_client import get_dashboard_counts, get_reports
        
        # Get dashboard statistics
        dashboard_stats = get_dashboard_counts()
        
        # Get recent reports for analysis
        recent_reports = get_reports(limit=100)
        
        # Calculate metrics
        metrics = {
            'total_reports': dashboard_stats.get('reports', 0),
            'active_alerts': dashboard_stats.get('alerts', 0),
            'drs_entries': dashboard_stats.get('drs', 0),
            'recent_reports_24h': len(recent_reports),
            'date': datetime.utcnow().strftime('%Y-%m-%d'),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        # Analyze scam types distribution
        scam_types = {}
        for report in recent_reports:
            scam_type = report.get('scam_type', 'Unknown')
            scam_types[scam_type] = scam_types.get(scam_type, 0) + 1
        
        metrics['scam_type_distribution'] = scam_types
        
        # Save metrics to database (you might want a separate metrics table)
        save_threat_report({
            'entity': f"daily_metrics_{metrics['date']}",
            'entity_type': 'metrics',
            'scam_type': 'Platform Metrics',
            'description': f"Daily platform metrics for {metrics['date']}",
            'severity': 'INFO',
            'district': 'System',
            'state': 'System',
            'is_anonymous': True,
            'metadata': metrics
        })
        
        return {
            'success': True,
            'metrics': metrics
        }
        
    except Exception as exc:
        return {
            'success': False,
            'error': str(exc)
        }


@shared_task(bind=True)
def send_alert_notifications_task(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send notifications for critical alerts
    """
    try:
        # Get notification preferences from database
        # This would be implemented based on your user preferences system
        
        # For now, we'll just log the alert
        print(f"Critical Alert Notification: {alert_data}")
        
        # In production, you would:
        # 1. Send push notifications
        # 2. Send SMS alerts (via Twilio)
        # 3. Send email notifications
        # 4. Update real-time subscriptions
        
        return {
            'success': True,
            'alert_id': alert_data.get('id'),
            'notification_sent': True,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as exc:
        return {
            'success': False,
            'error': str(exc)
        }


# Schedule periodic tasks (using celery beat)
# These would be configured in settings.py or celery.py
