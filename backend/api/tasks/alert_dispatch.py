from __future__ import annotations

from datetime import datetime, timedelta

from celery import shared_task

from api.services.supabase_client import supabase


@shared_task
def check_and_dispatch_alerts(district: str, state: str, scam_type: str):
    if not supabase:
        return {'skipped': True, 'reason': 'Supabase not configured'}

    now = datetime.utcnow()
    yesterday = now - timedelta(hours=24)

    recent = (
        supabase.table('threat_reports')
        .select('*', count='exact')
        .eq('location_state', state)
        .eq('scam_type', scam_type)
        .gte('created_at', yesterday.isoformat())
        .execute()
    )
    count_24h = int(recent.count or 0)

    if count_24h >= 5:
        severity = 'critical' if count_24h >= 10 else 'warning'
        title = f'Surge Alert: {scam_type} in {state}'
        description = f'{count_24h} reports in 24h for {scam_type} in {state}'

        # Best-effort dedupe using universally likely fields.
        try:
            existing = (
                supabase.table('alerts')
                .select('id', count='exact')
                .eq('title', title)
                .gte('created_at', yesterday.isoformat())
                .limit(1)
                .execute()
            )
            if int(existing.count or 0) > 0:
                return {'dispatched': True, 'count_24h': count_24h, 'severity': severity, 'deduped': True}
        except Exception:
            # Continue to insertion fallbacks; schema may not support created_at filters.
            pass

        # Try inserts from richest to minimal to handle schema variations.
        candidates = [
            {
                'title': title,
                'description': description,
                'district': district,
                'state': state,
                'scam_type': scam_type,
                'severity': severity,
                'alert_type': 'surge',
                'is_active': True,
                'affected_count': count_24h,
                'source': 'system',
            },
            {
                'title': title,
                'description': description,
                'state': state,
                'scam_type': scam_type,
                'severity': severity,
                'alert_type': 'surge',
                'is_active': True,
                'source': 'system',
            },
            {
                'title': title,
                'description': description,
                'severity': severity,
                'alert_type': 'surge',
                'source': 'system',
            },
            {
                'title': title,
                'description': description,
                'severity': severity,
                'alert_type': 'surge',
                'source': 'system',
            },
        ]

        last_error = None
        for payload in candidates:
            try:
                supabase.table('alerts').insert(payload).execute()
                return {'dispatched': True, 'count_24h': count_24h, 'severity': severity}
            except Exception as insert_err:
                last_error = str(insert_err)

        return {'dispatched': False, 'count_24h': count_24h, 'severity': severity, 'error': last_error}

    return {'dispatched': False, 'count_24h': count_24h}
