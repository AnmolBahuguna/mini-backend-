# DHIP Mini Project

DHIP is a full-stack cyber safety platform with a Django REST backend and a React + Vite frontend. It supports threat analysis workflows (URL, domain, phone, email, IP, UPI, message), community reporting, alerts, evidence vault flows, and safety-focused user experiences.

## Tech Stack

- Backend: Django 5, Django REST Framework, Celery, Redis, Supabase SDK
- Frontend: React 18, TypeScript, Vite, React Query, Zustand, Tailwind
- Async/Background: Celery worker + Celery Beat
- Data/Services: Supabase, Redis, optional external threat intelligence APIs

## Repository Structure

```text
Mini project/
  backend/                  # Django project (dhip) + API app
    api/                    # Views, services, tasks, auth, serializers
    dhip/                   # settings.py, urls.py, celery.py
    manage.py
    requirements.txt
  frontend/                 # React + Vite app
    src/
    package.json
    vite.config.ts
  docker-compose.yml        # django + celery + celery-beat + redis
  start-backend.bat         # Quick Windows backend startup helper
  start-backend.sh          # Quick Unix backend startup helper
```

## Key Features

- Threat check endpoints with DRS/risk output and enrichment hooks
- Auth flows (signup/login/logout/password reset/profile)
- Community report and stories endpoints
- Alerts, dashboard, heatmap, news, panic/support-chat surfaces
- Crime stats and CERT-In alert integrations
- Evidence vault upload/list/delete API routes

## Prerequisites

- Python 3.11+ (3.12/3.13 typically works)
- Node.js 18+ and npm
- Redis (local) for Celery/cache (optional but recommended)
- Supabase project credentials for non-demo mode

## Environment Configuration

Use template files with placeholder values:

- Root template: `.env.example`
- Backend template: `backend\.env.example`

Create:

- `backend\.env` for Django runtime variables
- `frontend\.env.local` for Vite variables (`VITE_*`)

Minimum commonly required values:

- Backend: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (and usually `SUPABASE_ANON_KEY`)
- Frontend: `VITE_API_BASE_URL` (for local dev usually `http://localhost:8000/api`)

## Local Development (Recommended)

### 1) Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

Quick option (Windows):

```powershell
.\start-backend.bat
```

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8000`.

## Docker Development

From project root:

```powershell
docker compose up --build
```

Services from `docker-compose.yml`:

- `django` on `8000`
- `celery` worker
- `celery-beat` scheduler
- `redis` on `6379`

## Frontend Scripts

Run inside `frontend\`:

- `npm run dev` - Vite development server
- `npm run build` - TypeScript build + production bundle
- `npm run preview` - Preview production build
- `npm run lint` - ESLint
- `npm run test` - Vitest run
- `npm run test:e2e` - Playwright tests

## Backend API Base

Django root URL includes API routes at:

- Base: `http://localhost:8000/api/`
- Health: `GET /api/`
- Auth health: `GET /api/health/auth/`

Representative endpoints:

- `POST /api/auth/signup/`
- `POST /api/auth/login/`
- `POST /api/threat-check/`
- `GET /api/threat-check/<uuid:id>/`
- `GET /api/threat-check/<uuid:id>/enrichment/`
- `GET|POST /api/reports/`
- `GET /api/alerts/`
- `GET /api/news/`
- `GET /api/crime-stats/`

## Notes

- In development, cache falls back to local memory if `REDIS_URL` is not set.
- Celery eager behavior may apply when Redis is unavailable (configured in settings).
- Existing test files were intentionally removed per your cleanup request; regenerate tests before CI usage.

## Security Reminder

If any real keys were previously committed locally, rotate them immediately and replace with placeholders in shared templates. Treat all `.env` files as sensitive and never commit secrets.

## Example Threat Check Response

{
  "type": "url",
  "status": "Safe",
  "risk_score": 8,
  "message": "No known malicious indicators found for this URL."
}
