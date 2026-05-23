# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
- Uses JWT token authentication
- Include token in header: `Authorization: Bearer <token>`

## Endpoints

### Health Check
```
GET /health/
```
Response: `{"status": "ok"}`

### Threat Detection
```
POST /threat-check/
Content-Type: application/json

{
  "input": "example.com",
  "type": "url"
}
```

### Alerts
```
GET /alerts/
GET /alerts/{id}/
POST /alerts/
```

### Dashboard
```
GET /dashboard/stats/
```

## Error Handling
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

All errors return:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
