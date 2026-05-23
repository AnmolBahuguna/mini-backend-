from __future__ import annotations

import os
import socket
from pathlib import Path
from urllib.parse import urlparse

# Load .env file with python-dotenv
from dotenv import load_dotenv
load_dotenv()

from decouple import Config, RepositoryEnv, config as decouple_config

BASE_DIR = Path(__file__).resolve().parent.parent

_CONFIG = None

env_file_override = os.environ.get('ENV_FILE')
if env_file_override:
    env_path = Path(env_file_override)
    if env_path.exists():
        _CONFIG = Config(RepositoryEnv(str(env_path)))

if _CONFIG is None:
    root_env = BASE_DIR.parent / '.env'
    if root_env.exists():
        _CONFIG = Config(RepositoryEnv(str(root_env)))

config = _CONFIG or decouple_config

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

if not SECRET_KEY:
    raise RuntimeError('SECRET_KEY environment variable is required')

ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'api',
    'django_celery_beat',
    'django_celery_results',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'dhip.urls'

# ── CORS ──────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',   # Vite dev
    'http://127.0.0.1:5173',   # Vite dev (127.0.0.1)
    'http://localhost:5174',   # Vite dev (alternate port)
    'http://127.0.0.1:5174',   # Vite dev (alternate port 127.0.0.1)
    'http://localhost:5175',   # Vite dev (alternate port 2)
    'http://127.0.0.1:5175',   # Vite dev (alternate port 2 127.0.0.1)
    'http://localhost:3000',   # Create React App
    'http://127.0.0.1:3000',   # Create React App (127.0.0.1)
]
CORS_ALLOW_METHODS = ['DELETE','GET','OPTIONS','PATCH','POST','PUT']
CORS_ALLOW_HEADERS = [
    'accept', 'authorization', 'content-type', 'x-csrftoken'
]
CORS_ALLOW_CREDENTIALS = True

# ── Database (Supabase via DATABASE_URL) ─────────────────────────────
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3'),
        conn_max_age=600,
        ssl_require=os.environ.get('DB_SSL', 'False') == 'True'
    )
}

# ── Redis Cache ────────────────────────────────────────────────
REDIS_URL = os.environ.get('REDIS_URL', '').strip()
REDIS_AVAILABLE = False
if REDIS_URL:
    try:
        parsed = urlparse(REDIS_URL)
        redis_host = parsed.hostname or 'localhost'
        redis_port = parsed.port or 6379
        with socket.create_connection((redis_host, redis_port), timeout=0.4):
            REDIS_AVAILABLE = True
    except OSError:
        REDIS_AVAILABLE = False

if REDIS_URL and REDIS_AVAILABLE:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                # Keep API responsive even if Redis is configured but temporarily unavailable.
                'IGNORE_EXCEPTIONS': True,
            },
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'dhip-cache',
        }
    }

# Belt-and-suspenders fallback for django-redis exception handling.
DJANGO_REDIS_IGNORE_EXCEPTIONS = True

# ── DRF ────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.auth.SupabaseJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'api.utils.custom_exception_handler',
}

# ── Celery ─────────────────────────────────────────────────────
# When Redis is unavailable, run tasks eagerly and avoid Redis-backed broker/result
# so request/response paths never block on connection retries.
CELERY_BROKER_URL = REDIS_URL if REDIS_AVAILABLE else 'memory://'
CELERY_RESULT_BACKEND = REDIS_URL if REDIS_AVAILABLE else 'cache+memory://'
CELERY_TASK_ALWAYS_EAGER = not REDIS_AVAILABLE
CELERY_TASK_EAGER_PROPAGATES = True

# ── Static Files ───────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ── Media Files (Evidence Vault uploads) ───────────────────────
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760

# Django basics
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging — console + rotating file (dhip_debug.log, max 10 MB, 3 backups)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] [{levelname}] [{name}] {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'dhip_debug.log',
            'maxBytes': 10 * 1024 * 1024,  # 10 MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'django': {'handlers': ['console'], 'level': 'WARNING'},
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
