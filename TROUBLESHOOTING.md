# Troubleshooting Guide

## Common Issues

### Backend Won't Start

**Error**: `Connection refused on port 8000`

**Solution**:
1. Check if port 8000 is already in use: `netstat -tuln | grep 8000`
2. Kill existing process: `lsof -ti:8000 | xargs kill -9`
3. Ensure PostgreSQL is running
4. Check database migrations: `python manage.py migrate`

### Database Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify PostgreSQL service is running
2. Check DATABASE_URL environment variable
3. Confirm database exists: `createdb mini_backend_db`
4. Test connection: `python manage.py dbshell`

### Frontend Build Fails

**Error**: `Module not found`

**Solution**:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node version: `node --version` (requires 18+)
3. Clear npm cache: `npm cache clean --force`

### JWT Token Expired

**Error**: `Invalid token` or `Token expired`

**Solution**:
1. Refresh token using refresh endpoint
2. Re-login if refresh fails
3. Check token expiration in settings (default 24h)

### Redis Connection Error

**Error**: `redis.exceptions.ConnectionError`

**Solution**:
1. Start Redis: `redis-server` or `docker run -d -p 6379:6379 redis`
2. Check Redis connection: `redis-cli ping` (should return PONG)
3. Verify REDIS_URL is correct

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check CORS_ALLOWED_ORIGINS in settings
2. Ensure frontend URL is listed
3. Verify credentials: true is set if needed
4. Check preflight requests are allowed

### API Rate Limiting

**Error**: `429 Too Many Requests`

**Solution**:
1. Check rate limit settings
2. Wait for throttle period to expire
3. Consider upgrading to higher rate limit tier

## Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Getting Help

1. Check the API_DOCUMENTATION.md
2. Review DEPLOYMENT.md for setup issues
3. See ARCHITECTURE.md for system design questions
4. Open an issue on GitHub with:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (OS, Python/Node versions)
   - Relevant logs
