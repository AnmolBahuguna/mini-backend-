# API Integration Guide

## Third-Party Services

### VirusTotal

**Endpoint**: https://www.virustotal.com/api/v3/

**Authentication**: API Key header

**Rate Limit**: 4 requests/minute (free tier)

```python
# Example: Check URL
response = requests.post(
    'https://www.virustotal.com/api/v3/urls',
    headers={'x-apikey': api_key},
    data={'url': url}
)
```

### Google Safe Browsing

**Endpoint**: https://safebrowsing.googleapis.com/

**Authentication**: API Key parameter

**Rate Limit**: 10,000 requests/day (free tier)

```python
# Example: Check URL
url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find"
response = requests.post(url, json=payload, params={'key': api_key})
```

### AbuseIPDB

**Endpoint**: https://api.abuseipdb.com/api/v2/

**Authentication**: API Key header

**Rate Limit**: 15 requests/24hrs (free tier)

### Twilio SMS

**Service**: SMS notifications

**Authentication**: Account SID + Auth Token

```python
from twilio.rest import Client

client = Client(account_sid, auth_token)
message = client.messages.create(
    body='Alert message',
    from_=from_number,
    to=to_number
)
```

## Response Caching

Cache API responses to reduce calls and improve performance:

```python
from django.views.decorators.cache import cache_page

@cache_page(3600)  # Cache for 1 hour
def threat_check_view(request):
    # View logic
    pass
```

## Error Handling

Always handle API failures gracefully:

```python
try:
    response = virustotal_api.check_url(url)
except APITimeoutError:
    # Retry with backoff
    pass
except RateLimitError:
    # Queue for later
    pass
except APIError as e:
    logger.error(f"API error: {e}")
    # Return cached result or default
```

## API Keys Management

- Store API keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Use different keys for dev/staging/production
- Monitor API usage

## Testing API Integrations

Mock external APIs in tests:

```python
@mock.patch('api.services.virustotal.VirusTotalAPI')
def test_threat_check(mock_vt):
    mock_vt.return_value.check_url.return_value = {
        'threat_level': 'HIGH'
    }
    result = check_threat(url)
    assert result['threat_level'] == 'HIGH'
```
