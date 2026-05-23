from __future__ import annotations

from urllib.parse import quote

import requests
from decouple import config
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_session():
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

IPQS_API_KEY = config('IPQS_API_KEY', default='')


def check_phone_number(phone: str) -> dict:
    """Check phone number fraud risk using IPQS"""
    if not IPQS_API_KEY:
        return {'error': 'IPQS_API_KEY not configured', 'fraud_score': 0, 'verdict': 'UNAVAILABLE'}

    clean_phone = phone.strip().replace(" ", "")
    url = f'https://ipqualityscore.com/api/json/phone/{IPQS_API_KEY}/{quote(clean_phone, safe="+")}'
    
    try:
        session = get_session()
        response = session.get(url, timeout=8)  # Reduced timeout
        response.raise_for_status()
        data = response.json()
        
        # Check for API errors
        if not data.get('success', True):
            return {'error': data.get('message', 'API error'), 'fraud_score': 0, 'verdict': 'ERROR'}
        
        fraud_score = int(data.get('fraud_score', 0) or 0)
        risky = data.get('risky', False)
        unsafe = bool(data.get('unsafe', risky or fraud_score >= 75))
        risk_score = int(data.get('risk_score', fraud_score) or fraud_score)
        
        verdict = 'CLEAN'
        if fraud_score >= 75:
            verdict = 'HIGH_RISK'
        elif fraud_score >= 50:
            verdict = 'MEDIUM_RISK'
        elif fraud_score >= 25:
            verdict = 'LOW_RISK'
        elif risky:
            verdict = 'SUSPICIOUS'
            
        return {
            'fraud_score': fraud_score,
            'risk_score': risk_score,
            'unsafe': unsafe,
            'verdict': verdict,
            'risky': risky,
            'country_code': data.get('country_code'),
            'carrier': data.get('carrier'),
            'phone_type': data.get('phone_type'),
            'active': data.get('active', True),
            'valid': data.get('valid', False),
            'line_type': data.get('line_type')
        }
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout', 'fraud_score': 0, 'verdict': 'TIMEOUT'}
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {str(e)[:50]}', 'fraud_score': 0, 'verdict': 'ERROR'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)[:50]}', 'fraud_score': 0, 'verdict': 'ERROR'}
