from __future__ import annotations

import os

import requests
from decouple import config
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_session():
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

ABUSE_KEY = config('ABUSEIPDB_API_KEY', default='')


def check_ip_reputation(ip_address: str) -> dict:
    if not ABUSE_KEY:
        return {'error': 'ABUSEIPDB_API_KEY not configured', 'abuse_score': 0, 'verdict': 'UNAVAILABLE'}

    try:
        session = get_session()
        response = session.get(
            'https://api.abuseipdb.com/api/v2/check',
            headers={'Key': ABUSE_KEY, 'Accept': 'application/json'},
            params={'ipAddress': ip_address, 'maxAgeInDays': '90', 'verbose': ''},
            timeout=8,  # Reduced timeout
        )
        response.raise_for_status()
        
        data = (response.json() or {}).get('data', {})
        score = int(data.get('abuseConfidenceScore', 0) or 0)

        verdict = 'CLEAN'
        if score > 75:
            verdict = 'MALICIOUS'
        elif score > 25:
            verdict = 'SUSPICIOUS'

        return {
            'abuse_score': score,
            'total_reports': int(data.get('totalReports', 0) or 0),
            'country': data.get('countryCode', 'Unknown'),
            'isp': data.get('isp', 'Unknown'),
            'is_tor': bool(data.get('isTor', False)),
            'verdict': verdict,
        }
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout', 'abuse_score': 0, 'verdict': 'TIMEOUT'}
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {str(e)[:50]}', 'abuse_score': 0, 'verdict': 'ERROR'}
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"AbuseIPDB Error: {e}")
        return {'error': f'Unexpected error: {str(e)[:50]}', 'abuse_score': 0, 'verdict': 'ERROR'}
