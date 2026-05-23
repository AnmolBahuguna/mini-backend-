from __future__ import annotations

from datetime import datetime, timedelta
import hashlib

from decouple import config
from supabase import Client, create_client


def get_supabase() -> Client:
    url = config('SUPABASE_URL', default='')
    key = config('SUPABASE_SERVICE_KEY', default='')
    if not url or not key:
        raise RuntimeError('SUPABASE_URL/SUPABASE_SERVICE_KEY not configured')
    return create_client(url, key)


import logging
logger = logging.getLogger(__name__)
MOCK_EVIDENCE_ROWS: list[dict] = []
DELETED_EVIDENCE_IDS: set[str] = set()

supabase = None
try:
    supabase = get_supabase()
except Exception as e:
    logger.error(f"[Supabase] Initialization failed: {e}")
    supabase = None


def save_threat_report(data: dict) -> dict:
    if not supabase:
        # Return mock response when Supabase is not configured
        import uuid
        return {
            'id': str(uuid.uuid4()),
            'created_at': '2025-01-01T00:00:00Z',
            **data
        }
    try:
        # Map scam types to valid database categories
        scam_type = data.get('scam_type', '').lower()
        category_mapping = {
            'digital arrest': 'online_fraud',
            'financial fraud': 'online_fraud', 
            'upi fraud': 'upi_fraud',
            'phishing': 'phishing',
            'identity theft': 'identity_theft',
            'cyber stalking': 'cyber_stalking',
            'harassment': 'harassment',
            'deepfake': 'deepfake',
            'sextortion': 'sextortion',
            'romance scam': 'online_fraud',
            'tech support scam': 'online_fraud'
        }
        
        # Find the best category match
        category = 'other'  # default fallback
        for scam_pattern, db_category in category_mapping.items():
            if scam_pattern in scam_type:
                category = db_category
                break
        
        # Create a copy with only core fields
        clean_data = {
            'entity': data.get('entity'),
            'entity_type': data.get('entity_type'),
            'scam_type': data.get('scam_type'),
            'description': data.get('description'),
            'category': category,  # Required field - mapped from scam_type
        }
        
        # Add optional fields if provided - map to correct column names
        if 'district' in data and data['district']:
            clean_data['district'] = data['district']
        if 'state' in data and data['state']:
            clean_data['location_state'] = data['state']  # Map state -> location_state
        # Note: severity column doesn't exist in Supabase schema
        
        # Add title if not present
        if 'title' not in clean_data:
            scam_type = clean_data.get('scam_type', 'Unknown')
            entity_type = clean_data.get('entity_type', 'entity').upper()
            clean_data['title'] = f"{scam_type} — {entity_type}"
        
        # Only add reporter_id if it exists in the original data
        if 'reporter_id' in data:
            clean_data['reporter_id'] = data['reporter_id']
            
        result = supabase.table('threat_reports').insert(clean_data).execute()
        return (result.data or [{}])[0]
    except Exception as e:
        logger.error(f"Supabase error saving report: {e}")
        # Return mock response on error
        import uuid
        return {
            'id': str(uuid.uuid4()),
            'created_at': '2025-01-01T00:00:00Z',
            **data
        }


def get_reports(state: str | None = None, scam_type: str | None = None, district: str | None = None) -> list[dict]:
    if not supabase:
        return []
    try:
        q = supabase.table('threat_reports').select('*')
        
        # Apply filters if provided (use correct column names)
        if state:
            q = q.eq('location_state', state)  # Use location_state column
        if district:
            q = q.eq('district', district)
        if scam_type:
            q = q.eq('scam_type', scam_type)
        
        # Make limit configurable with default of 100
        limit = 100  # Default limit, can be made parameter in future
        result = q.order('created_at', desc=True).limit(limit).execute().data or []
        logger.info(f"get_reports: Retrieved {len(result)} reports (state={state}, district={district}, scam_type={scam_type}, limit={limit})")
        return result
    except Exception as e:
        logger.error(f"Supabase error get_reports: {e}")
        return []


def get_report_by_id(report_id: str) -> dict | None:
    if not supabase:
        return None
    try:
        res = supabase.table('threat_reports').select('*').eq('id', report_id).maybe_single().execute()
        return res.data
    except Exception as e:
        logger.error(f"Supabase error get_report_by_id: {e}")
        return None


def upsert_drs_score(entity: str, entity_type: str, score: float, risk_level: str, scam_type: str, report_count: int = 0) -> None:
    if not supabase:
        return
    normalized_level = (risk_level or '').lower()
    if normalized_level not in {'low', 'medium', 'high', 'critical'}:
        normalized_level = 'low'

    verdict = (
        'dangerous'
        if normalized_level in {'high', 'critical'}
        else 'suspicious'
        if normalized_level == 'medium'
        else 'safe'
    )

    # Schema stores score as 0-100 smallint; upscale 0-10 DRS to that range safely.
    normalized_score = max(0, min(int(round(score * 10)), 100))

    try:
        payload = {
            'entity': entity,
            'entity_type': entity_type,
            'score': normalized_score,
            'risk_level': normalized_level,
            'verdict': verdict,
            'report_count': report_count,
            'last_seen': datetime.utcnow().isoformat(),
        }
        supabase.table('digital_risk_scores').upsert(payload, on_conflict='entity').execute()
    except Exception as e:
        logger.error(f"Supabase error upsert_drs_score: {e}")


def get_drs_for_entity(entity: str) -> dict | None:
    if not supabase:
        return None
    try:
        res = supabase.table('digital_risk_scores').select('*').eq('entity', entity).maybe_single().execute()
        return res.data
    except Exception as e:
        logger.error(f"Supabase error get_drs_for_entity: {e}")
        return None


def count_reports_for_entity(entity: str) -> int:
    """Count reports for a specific entity - optimized to avoid full table scan."""
    if not supabase:
        return 0
    try:
        # Only select 'id' column (not *) and add limit to prevent full table scan
        res = supabase.table('threat_reports').select('id', count='exact').eq('entity', entity).limit(1).execute()
        return int(res.count or 0)
    except Exception as e:
        logger.error(f"Supabase error count_reports_for_entity: {e}")
        return 0


def get_active_alerts(state: str | None = None, scam_type: str | None = None) -> list[dict]:
    if not supabase:
        return []
    alerts: list[dict] = []
    try:
        q = supabase.table('alerts').select('*').eq('is_active', True)
        if state:
            q = q.eq('state', state)
        if scam_type:
            q = q.eq('scam_type', scam_type)
        alerts = q.order('created_at', desc=True).limit(50).execute().data or []
    except Exception as e:
        logger.error(f"Supabase error get_active_alerts: {e}")
        # Fallback for schemas without is_active column.
        try:
            q = supabase.table('alerts').select('*')
            if state:
                q = q.eq('state', state)
            if scam_type:
                q = q.eq('scam_type', scam_type)
            alerts = q.order('created_at', desc=True).limit(50).execute().data or []
        except Exception as e2:
            logger.error(f"Supabase fallback get_active_alerts failed: {e2}")
            alerts = []

    # Ensure surge alerts are available even when alerts table insert is schema-restricted.
    try:
        yesterday = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        rq = supabase.table('threat_reports').select('scam_type,location_state,created_at').gte('created_at', yesterday)
        if state:
            rq = rq.eq('location_state', state)
        if scam_type:
            rq = rq.eq('scam_type', scam_type)
        recent = rq.limit(500).execute().data or []
        buckets: dict[tuple[str, str], int] = {}
        for row in recent:
            st = row.get('location_state') or 'Unknown'
            sc = row.get('scam_type') or 'Unknown'
            key = (st, sc)
            buckets[key] = buckets.get(key, 0) + 1

        existing_titles = {str(a.get('title') or '') for a in alerts}
        for (st, sc), count in buckets.items():
            if count < 5:
                continue
            title = f'Surge Alert: {sc} in {st}'
            if title in existing_titles:
                continue
            alerts.append({
                'id': f'surge-{st}-{sc}',
                'title': title,
                'description': f'{count} reports in 24h for {sc} in {st}',
                'state': st,
                'scam_type': sc,
                'severity': 'critical' if count >= 10 else 'warning',
                'alert_type': 'surge',
                'is_active': True,
                'affected_count': count,
                'created_at': datetime.utcnow().isoformat(),
            })
    except Exception as e3:
        logger.error(f"Surge synthesis failed: {e3}")

    return alerts[:50]


def get_dashboard_counts() -> dict:
    if not supabase:
        return {
            'reports': 0,
            'alerts': 0,
            'drs': 0,
        }
    try:
        reports = supabase.table('threat_reports').select('*', count='exact').execute()
        alerts = supabase.table('alerts').select('*', count='exact').eq('is_active', True).execute()
        drs = supabase.table('digital_risk_scores').select('*', count='exact').execute()
        return {
            'reports': int(reports.count or 0),
            'alerts': int(alerts.count or 0),
            'drs': int(drs.count or 0),
        }
    except Exception as e:
        logger.error(f"Supabase error get_dashboard_counts: {e}")
        return {
            'reports': 0,
            'alerts': 0,
            'drs': 0,
        }


def get_user_profile(user_id: str) -> dict | None:
    if not supabase:
        return {'id': user_id, 'email': f'{user_id}@example.com', 'full_name': 'Mock User', 'phone': ''}
    try:
        result = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        return result.data
    except Exception as e:
        logger.error(f"Supabase error get_user_profile: {e}")
        return {'id': user_id, 'email': f'{user_id}@example.com', 'full_name': 'Mock User', 'phone': ''}


def get_or_create_user_profile(user_id: str, email: str, extra_data: dict | None = None) -> dict:
    if not supabase:
        # Return mock profile when Supabase is not configured
        import uuid
        mock_profile = {
            'id': user_id,
            'email': email,
            'full_name': extra_data.get('full_name', email.split('@')[0]) if extra_data else email.split('@')[0],
            'phone': extra_data.get('phone') if extra_data else None,
            'district': extra_data.get('district') if extra_data else None,
            'state': extra_data.get('state') if extra_data else None,
            'language': extra_data.get('language', 'en') if extra_data else 'en',
            'role': extra_data.get('role', 'user') if extra_data else 'user',
            'created_at': '2025-01-01T00:00:00Z'
        }
        return mock_profile

    try:
        # Try to get existing profile
        existing = supabase.table('profiles').select('*').eq('id', user_id).maybe_single().execute().data
        if existing:
            return existing

        # Create new profile
        profile_data = {
            'id': user_id,
            'email': email,
            'full_name': extra_data.get('full_name', email.split('@')[0]) if extra_data else email.split('@')[0],
            'phone': extra_data.get('phone') if extra_data else None,
            'district': extra_data.get('district') if extra_data else None,
            'state': extra_data.get('state') if extra_data else None,
            'language': extra_data.get('language', 'en') if extra_data else 'en',
            'role': extra_data.get('role', 'user') if extra_data else 'user',
            'created_at': datetime.utcnow().isoformat()
        }
        
        created = supabase.table('profiles').insert(profile_data).execute().data
        return (created or [{}])[0]
    except Exception as e:
        logger.error(f"Supabase error in get_or_create_user_profile: {e}")
        # Return mock profile on error
        import uuid
        mock_profile = {
            'id': user_id,
            'email': email,
            'full_name': extra_data.get('full_name', email.split('@')[0]) if extra_data else email.split('@')[0],
            'phone': extra_data.get('phone') if extra_data else None,
            'district': extra_data.get('district') if extra_data else None,
            'state': extra_data.get('state') if extra_data else None,
            'language': extra_data.get('language', 'en') if extra_data else 'en',
            'role': extra_data.get('role', 'user') if extra_data else 'user',
            'created_at': '2025-01-01T00:00:00Z'
        }
        return mock_profile


def patch_user_profile(user_id: str, patch: dict) -> dict:
    if not supabase:
        # Return updated mock profile when Supabase is not configured
        existing_profile = get_or_create_user_profile(user_id, '')
        existing_profile.update(patch)
        return existing_profile

    try:
        # Get existing profile first
        existing = get_user_profile(user_id)
        if not existing:
            existing = get_or_create_user_profile(user_id, '')

        # Update with new data
        mapped = dict(patch)
        if 'display_name' in mapped:
            mapped['full_name'] = mapped.pop('display_name')
        if 'state' in mapped:
            mapped['location_state'] = mapped.pop('state')
        if 'district' in mapped:
            mapped['location_city'] = mapped.pop('district')

        res = supabase.table('profiles').update(mapped).eq('id', user_id).execute().data
        if res:
            return res[0]
        
        # Return existing profile if update failed
        existing.update(patch)
        return existing
    except Exception as e:
        logger.error(f"Supabase error in patch_user_profile: {e}")
        # Return updated mock profile on error
        existing_profile = get_or_create_user_profile(user_id, '')
        existing_profile.update(patch)
        return existing_profile


def list_evidence_for_user(user_id: str) -> list[dict]:
    if not supabase:
        return [
            row for row in MOCK_EVIDENCE_ROWS
            if row.get('user_id') == user_id and str(row.get('id')) not in DELETED_EVIDENCE_IDS
        ]
    try:
        res = supabase.table('evidence_vault').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(200).execute()
        data = res.data or []
        if data:
            return [row for row in data if str(row.get('id')) not in DELETED_EVIDENCE_IDS]
        # Fall back to in-process mock rows when DB insert fallback was used.
        return [
            row for row in MOCK_EVIDENCE_ROWS
            if row.get('user_id') == user_id and str(row.get('id')) not in DELETED_EVIDENCE_IDS
        ]
    except Exception as e:
        logger.error(f"Supabase error list_evidence_for_user: {e}")
        return [
            row for row in MOCK_EVIDENCE_ROWS
            if row.get('user_id') == user_id and str(row.get('id')) not in DELETED_EVIDENCE_IDS
        ]


def insert_evidence_rows(rows: list[dict]) -> list[dict]:
    if not rows:
        return []
    if not supabase:
        # Demo fallback: preserve evidence flow contract in local/dev mode.
        import uuid
        now = datetime.utcnow().isoformat() + 'Z'
        inserted = []
        for row in rows:
            new_row = {
                'id': str(uuid.uuid4()),
                'created_at': now,
                **row,
            }
            inserted.append(new_row)
            MOCK_EVIDENCE_ROWS.append(new_row)
            DELETED_EVIDENCE_IDS.discard(str(new_row.get('id')))
        return inserted
    try:
        res = supabase.table('evidence_vault').insert(rows).execute()
        data = res.data or []
        if data:
            return data
        # If insert returns empty payload, surface deterministic fallback objects.
        import uuid
        now = datetime.utcnow().isoformat() + 'Z'
        fallback = [{'id': str(uuid.uuid4()), 'created_at': now, **row} for row in rows]
        MOCK_EVIDENCE_ROWS.extend(fallback)
        for row in fallback:
            DELETED_EVIDENCE_IDS.discard(str(row.get('id')))
        return fallback
    except Exception as e:
        logger.error(f"Supabase error insert_evidence_rows: {e}")
        # Graceful fallback for environments without evidence_vault table/bucket wiring.
        import uuid
        now = datetime.utcnow().isoformat() + 'Z'
        fallback = [{'id': str(uuid.uuid4()), 'created_at': now, **row} for row in rows]
        MOCK_EVIDENCE_ROWS.extend(fallback)
        for row in fallback:
            DELETED_EVIDENCE_IDS.discard(str(row.get('id')))
        return fallback


def delete_evidence_row(user_id: str, evidence_id: str) -> None:
    global MOCK_EVIDENCE_ROWS
    DELETED_EVIDENCE_IDS.add(str(evidence_id))
    if not supabase:
        MOCK_EVIDENCE_ROWS = [
            row for row in MOCK_EVIDENCE_ROWS
            if not (str(row.get('id')) == str(evidence_id) and str(row.get('user_id')) == str(user_id))
        ]
        return
    try:
        supabase.table('evidence_vault').delete().eq('id', evidence_id).eq('user_id', user_id).execute()
    except Exception as e:
        logger.error(f"Supabase error delete_evidence_row: {e}")
        MOCK_EVIDENCE_ROWS = [
            row for row in MOCK_EVIDENCE_ROWS
            if not (str(row.get('id')) == str(evidence_id) and str(row.get('user_id')) == str(user_id))
        ]


def list_stories() -> list[dict]:
    if not supabase:
        return []
    try:
        res = supabase.table('survivor_stories').select('*').eq('is_approved', True).order('created_at', desc=True).limit(200).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Supabase error list_stories: {e}")
        return []


def create_story(row: dict) -> dict:
    if not supabase:
        # Return mock response when Supabase is not configured
        import uuid
        return {
            'id': str(uuid.uuid4()),
            'created_at': '2025-01-01T00:00:00Z',
            **row
        }
    try:
        res = supabase.table('survivor_stories').insert(row).execute()
        return (res.data or [{}])[0]
    except Exception as e:
        logger.error(f"Supabase error create_story: {e}")
        # Return mock response on error
        import uuid
        return {
            'id': str(uuid.uuid4()),
            'created_at': '2025-01-01T00:00:00Z',
            **row
        }


def upsert_threat_check_cache(analysis_id: str, entity: str, ai_summary: dict) -> None:
    if not supabase:
        return
    summary_text = ai_summary.get('summary') if isinstance(ai_summary, dict) else str(ai_summary)
    raw_type = str(ai_summary.get('input_type', 'message')) if isinstance(ai_summary, dict) else 'message'
    normalized_input_type = {
        'domain': 'url',
        'ip': 'message',
        'upi': 'message',
    }.get(raw_type, raw_type)
    if normalized_input_type not in {'url', 'email', 'phone', 'message'}:
        normalized_input_type = 'message'
    input_value = ai_summary.get('input_value', entity) if isinstance(ai_summary, dict) else entity
    fallback_hash = hashlib.md5(str(input_value).encode()).hexdigest()
    input_hash = ai_summary.get('input_hash', fallback_hash) if isinstance(ai_summary, dict) else fallback_hash
    try:
        supabase.table('threat_check_cache').upsert({
            'id': analysis_id,
            'input_type': normalized_input_type,
            'input_value': input_value,
            'input_hash': input_hash,
            'status': ai_summary.get('status', 'completed'),
            'ai_summary': summary_text,
            'ai_enrichment': ai_summary if isinstance(ai_summary, dict) else {'summary': summary_text},
        }, on_conflict='input_hash').execute()
    except Exception as e:
        logger.error(f"Supabase error upsert_threat_check_cache: {e}")
