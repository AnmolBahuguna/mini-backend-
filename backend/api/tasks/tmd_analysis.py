from __future__ import annotations

from celery import shared_task

from api.ml.tmd_model import TMDModel
from api.services.supabase_client import supabase


@shared_task
def run_tmd_analysis():
    if not supabase:
        return {'skipped': True, 'reason': 'Supabase not configured'}

    reports = (
        supabase.table('threat_reports')
        .select('*')
        .order('created_at', desc=True)
        .limit(1000)
        .execute()
    )
    data = reports.data or []

    tmd = TMDModel()
    clusters = tmd.detect_mutations(data)

    for cluster in clusters:
        supabase.table('tmd_predictions').upsert(cluster).execute()

    return {'clusters_found': len(clusters)}
