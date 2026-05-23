# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│                     Running on port 3000                     │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Django + DRF)                  │
│                     Running on port 8000                     │
├──────────────────────┬──────────────────────┬────────────────┤
│  Authentication      │   Threat Detection   │  Data Storage  │
│  - JWT Tokens        │   - VirusTotal       │  - PostgreSQL  │
│  - Supabase Auth     │   - Google Safe      │  - Redis Cache │
│                      │   - AbuseIPDB        │                │
├──────────────────────┼──────────────────────┴────────────────┤
│  Task Queue (Celery) │   External Services                   │
│  - Async Tasks       │   - Twilio SMS                        │
│  - AI Enrichment     │   - GNews API                         │
│  - Alert Dispatch    │   - OpenRouter LLM                    │
└──────────────────────┴───────────────────────────────────────┘
```

## Key Services

### Threat Detection
- Analyzes URLs, IPs, and phone numbers
- Integrates with multiple threat intelligence APIs
- Machine learning risk scoring

### User Management
- Registration and authentication
- Profile management
- Role-based access control

### Alert System
- Real-time threat notifications
- Alert aggregation
- Email/SMS notifications via Twilio

### Task Processing
- Asynchronous job processing
- AI-powered threat analysis enrichment
- Alert dispatch scheduling

## Data Flow

1. User submits threat check request via frontend
2. API validates input and authenticates user
3. Request queued for async processing
4. External APIs queried in parallel
5. Results aggregated and scored
6. ML model provides risk assessment
7. Alert created if threat detected
8. User notified via email/SMS
9. Results stored in database

## Technology Stack

- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL, Redis
- **Task Queue**: Celery with Redis
- **Authentication**: JWT, Supabase
- **API Integration**: VirusTotal, Google Safe Browsing, AbuseIPDB
- **Deployment**: Docker, Docker Compose
