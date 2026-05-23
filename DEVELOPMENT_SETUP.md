# Development Environment Setup

## System Requirements

- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL 13+
- Redis 6+
- Git

## IDE Setup

### Recommended IDEs
- Visual Studio Code (recommended)
- PyCharm Professional/Community
- WebStorm

### VS Code Extensions
```
Extensions to install:
- Python (Microsoft)
- Pylance
- Django (Baptiste Darthenay)
- ES7+ React/Redux/React-Native snippets
- Prettier
- ESLint
- Git Graph
- REST Client
```

### PyCharm Configuration
- Set interpreter to Python 3.11
- Enable Django support
- Configure code style to PEP 8

## Pre-commit Hooks

Install pre-commit hooks to validate code before commits:

```bash
pip install pre-commit
pre-commit install
```

This will automatically run:
- Code formatting (black)
- Linting (pylint, eslint)
- Import sorting (isort)
- Type checking (mypy)

## Local Development Workflow

1. Create feature branch
2. Make changes
3. Run tests locally
4. Commit with descriptive messages
5. Push to fork
6. Create pull request

## Debugging

### Backend Debugging

```python
import pdb; pdb.set_trace()  # Breakpoint
```

Or use Django Debug Toolbar with:
```
DEBUG = True
INSTALLED_APPS += ['debug_toolbar']
```

### Frontend Debugging

- Use React DevTools browser extension
- Chrome DevTools Network tab
- Console for logging

## Environment Files

Create `.env` files (never commit these):

```bash
# backend/.env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key

# frontend/.env.local
VITE_API_URL=http://localhost:8000/api
```

## Common Commands

```bash
# Backend
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Frontend
npm run dev
npm run build
npm run lint
npm test

# Docker
docker-compose up
docker-compose down
```
