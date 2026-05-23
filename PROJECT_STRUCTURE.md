# Project Structure Overview

## Directory Layout

```
mini-backend/
├── backend/                     # Django backend
│   ├── api/                     # Main API app
│   │   ├── models.py            # Database models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views/               # API views
│   │   ├── services/            # Business logic
│   │   │   ├── threat_check.py
│   │   │   ├── virustotal.py
│   │   │   ├── supabase_client.py
│   │   │   └── ...
│   │   ├── urls.py              # URL routing
│   │   ├── permissions.py       # Authentication
│   │   ├── throttling.py        # Rate limiting
│   │   └── tests/               # API tests
│   ├── dhip/                    # Django project settings
│   │   ├── settings.py          # Configuration
│   │   ├── urls.py              # URL patterns
│   │   ├── wsgi.py              # WSGI app
│   │   └── celery.py            # Celery config
│   ├── manage.py                # Django CLI
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Docker image
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom hooks
│   │   ├── store/               # State management
│   │   ├── lib/                 # Utilities
│   │   ├── api/                 # API client
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx              # Root component
│   ├── public/                  # Static assets
│   ├── package.json             # NPM dependencies
│   ├── vite.config.ts           # Vite config
│   └── tsconfig.json            # TypeScript config
│
├── docker-compose.yml           # Multi-container setup
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guide
├── CODE_OF_CONDUCT.md           # Community guidelines
├── LICENSE                      # MIT License
│
└── Documentation/
    ├── API_DOCUMENTATION.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── TROUBLESHOOTING.md
    ├── TESTING.md
    ├── PERFORMANCE.md
    ├── DATABASE_SCHEMA.md
    ├── ROADMAP.md
    ├── GLOSSARY.md
    ├── DEVELOPMENT_SETUP.md
    ├── API_INTEGRATION.md
    └── CHANGELOG.md
```

## Key Files

### Backend Configuration
- `backend/dhip/settings.py` - Main settings (DEBUG, ALLOWED_HOSTS, etc.)
- `backend/dhip/urls.py` - URL routing configuration
- `backend/.env.example` - Environment variables template

### Frontend Configuration
- `frontend/vite.config.ts` - Build configuration
- `frontend/tsconfig.json` - TypeScript settings
- `frontend/package.json` - Dependencies and scripts

### Docker
- `docker-compose.yml` - Multi-container orchestration
- `backend/Dockerfile` - Backend image definition
- `frontend/Dockerfile` - Frontend image definition

## Naming Conventions

### Backend
- Models: PascalCase (e.g., `UserAlert`)
- Views: Descriptive with ViewSet suffix (e.g., `AlertViewSet`)
- Services: Descriptive action words (e.g., `threat_check.py`)
- URL patterns: kebab-case (e.g., `/api/threat-check/`)

### Frontend
- Components: PascalCase (e.g., `ThreatAnalysis.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Hooks: Prefix with `use` (e.g., `useThreatCheck.ts`)
- Types: PascalCase (e.g., `ThreatCheckResponse`)

## Module Organization

Each module should follow:
```
module/
├── __init__.py
├── models.py         (if needed)
├── serializers.py    (if needed)
├── views.py
├── urls.py
├── services.py       (business logic)
└── tests.py
```

This structure ensures:
- Clear separation of concerns
- Easy navigation
- Scalability
- Maintainability
