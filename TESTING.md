# Testing Guide

## Running Tests

### Backend Tests

```bash
cd backend
python manage.py test
```

Run specific test:
```bash
python manage.py test api.tests.test_auth
```

With coverage:
```bash
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Coverage report:
```bash
npm test -- --coverage
```

## Test Structure

### Backend
```
backend/api/tests/
├── test_auth.py
├── test_threat_check.py
├── test_alerts.py
└── test_serializers.py
```

### Frontend
```
frontend/src/__tests__/
├── components/
├── hooks/
├── pages/
└── utils/
```

## Writing Tests

### Django Test Example
```python
from django.test import TestCase
from api.models import Alert

class AlertModelTest(TestCase):
    def setUp(self):
        self.alert = Alert.objects.create(
            title="Test Alert",
            description="Test Description"
        )
    
    def test_alert_creation(self):
        self.assertEqual(self.alert.title, "Test Alert")
```

### React Test Example
```typescript
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText(/text/i)).toBeInTheDocument();
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled nightly runs

See CI_CD_SETUP.md for GitHub Actions configuration.

## Test Coverage Goals

- Backend: >80% coverage
- Frontend: >70% coverage
- Critical paths: 100% coverage
