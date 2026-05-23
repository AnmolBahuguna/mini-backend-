# GitHub Actions CI/CD Workflow

## Setup

Create `.github/workflows/ci.yml` to automate testing and deployment:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        pip install -r backend/requirements.txt
    - name: Run tests
      run: |
        python backend/manage.py test
```

## Deployment

Deployment workflows can be added for production environments.
