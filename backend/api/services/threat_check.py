from __future__ import annotations

from api.services.supabase_client import supabase


def check_entity(entity: str, entity_type: str) -> dict:
    """
    Check an entity against digital_risk_scores and threat_reports tables.
    
    Args:
        entity: The entity to check (URL, phone, etc.)
        entity_type: Type of entity (url, phone, etc.)
    
    Returns:
        Dict with entity, entity_type, drs_score, risk_level, report_count, reports[]
    """
    try:
        # Query digital_risk_scores table
        drs_result = None
        if supabase:
            drs_query = supabase.table('digital_risk_scores').select('*').eq('entity', entity)
            drs_result = drs_query.maybe_single().execute()
        
        # Query threat_reports table and count results
        reports = []
        report_count = 0
        if supabase:
            reports_query = supabase.table('threat_reports').select('*').eq('entity', entity).order('created_at', desc=True).limit(10)
            reports_result = reports_query.execute()
            reports = reports_result.data or []
            report_count = len(reports)
        
        # Extract DRS data or set defaults
        if drs_result and drs_result.data:
            drs_data = drs_result.data
            drs_score = drs_data.get('score', 0)
            risk_level = drs_data.get('risk_level', 'unknown')
            scam_type = drs_data.get('scam_type', 'unknown')
        else:
            drs_score = 0
            risk_level = "unknown"
            scam_type = "unknown"

        return {
            'entity': entity,
            'entity_type': entity_type,
            'drs_score': drs_score,
            'risk_level': risk_level,
            'scam_type': scam_type,
            # Frontend expects reports_count (plural) for the threat check detail payload
            'reports_count': report_count,
            'reports': reports
        }
        
    except Exception as e:
        print(f"Error in check_entity: {e}")
        return {
            'entity': entity,
            'entity_type': entity_type,
            'drs_score': 0,
            'risk_level': 'UNKNOWN',
            'scam_type': 'Unknown',
            'reports_count': 0,
            'reports': [],
            'error': str(e)
        }
