import os

from celery import Celery
from celery.schedules import crontab
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dhip.settings')

app = Celery('dhip')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'tmd-analysis-every-6h': {
        'task': 'api.tasks.tmd_analysis.run_tmd_analysis',
        'schedule': crontab(minute=0, hour='*/6'),
    },
}

app.conf.task_routes = {
    'api.tasks.ai_enrichment.enrich_with_ai': {'queue': 'ai'},
    'api.tasks.alert_dispatch.check_and_dispatch_alerts': {'queue': 'alerts'},
    'api.tasks.tmd_analysis.run_tmd_analysis': {'queue': 'analysis'},
}

app.conf.task_default_queue = 'default'
app.conf.task_default_exchange = 'default'
app.conf.task_default_routing_key = 'default'
