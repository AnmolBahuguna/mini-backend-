# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- Git

## Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Docker Deployment

```bash
docker-compose up -d
```

Access the application at `http://localhost:3000`

## Environment Configuration

Copy `.env.example` to `.env` and update with your credentials:
```bash
cp backend/.env.example backend/.env
```

Required variables:
- `DJANGO_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- API keys for threat detection services

## Database Setup

```bash
python manage.py migrate
python manage.py createsuperuser
```

## Production Deployment

1. Set `DEBUG=False` in production
2. Use a production database (PostgreSQL recommended)
3. Configure allowed hosts
4. Set up proper CORS configuration
5. Use environment secrets management
6. Enable HTTPS

## Troubleshooting

See BACKEND_START_SUMMARY.txt and STARTUP_GUIDE.md for detailed setup help.
