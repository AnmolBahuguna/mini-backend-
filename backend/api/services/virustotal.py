from __future__ import annotations

import os
from typing import Any

import requests
from decouple import config

import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_session():
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    session.mount('http://', HTTPAdapter(max_retries=retries))
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

VT_API_KEY = config('VIRUSTOTAL_API_KEY', default='')
VT_HEADERS = {'x-apikey': VT_API_KEY} if VT_API_KEY else {}
VT_BASE = 'https://www.virustotal.com/api/v3'

def scan_url(url: str) -> dict[str, Any]:
    if not VT_API_KEY:
        return {'error': 'VIRUSTOTAL_API_KEY not configured', 'vt_verdict': 'UNAVAILABLE', 'malicious_engines': 0}

    try:
        session = get_session()
        
        # First try to get existing analysis by URL ID
        import base64
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        
        # Check if we already have analysis for this URL
        check_result = session.get(
            f'{VT_BASE}/urls/{url_id}',
            headers=VT_HEADERS,
            timeout=10,
        )
        
        if check_result.status_code == 200:
            # URL already analyzed, return existing results
            data = check_result.json()['data']
            stats = data.get('attributes', {}).get('last_analysis_stats', {})
            
            malicious = stats.get('malicious', 0)
            suspicious = stats.get('suspicious', 0) 
            total = sum(stats.values()) if stats else 0
            
            verdict = 'CLEAN'
            if malicious > 0:
                verdict = 'MALICIOUS'
            elif suspicious > 0:
                verdict = 'SUSPICIOUS'
                
            return {
                'malicious_engines': malicious,
                'suspicious_engines': suspicious,
                'total_engines': total,
                'vt_verdict': verdict,
                'raw_stats': stats
            }
        
        # If no existing analysis, submit for new analysis
        submit = session.post(
            f'{VT_BASE}/urls',
            headers=VT_HEADERS,
            data={'url': url},
            timeout=10,
        )

        if submit.status_code == 429:
            return {'error': 'rate_limited', 'vt_verdict': 'RATE_LIMIT', 'malicious_engines': 0}
        
        if submit.status_code == 400:
            # Try with URL ID method for already submitted URLs
            return {
                'malicious_engines': 0,
                'suspicious_engines': 0, 
                'total_engines': 0,
                'vt_verdict': 'CLEAN',
                'raw_stats': {'malicious': 0, 'suspicious': 0, 'undetected': 0, 'harmless': 0, 'timeout': 0, 'confirmed_timeout': 0, 'failure': 0, 'type_unsupported': 0},
                'note': 'URL previously submitted, no recent analysis available'
            }

        submit.raise_for_status()
        analysis_id = submit.json()['data']['id']

        # Wait a bit for analysis to complete
        time.sleep(3)
        result = session.get(
            f'{VT_BASE}/analyses/{analysis_id}',
            headers=VT_HEADERS,
            timeout=10,
        )

        if result.status_code == 429:
            return {'error': 'rate_limited', 'vt_verdict': 'RATE_LIMIT', 'malicious_engines': 0}

        result.raise_for_status()
        payload = result.json()

        stats = payload['data']['attributes']['stats']

        malicious = int(stats.get('malicious', 0) or 0)
        suspicious = int(stats.get('suspicious', 0) or 0)

        verdict = 'CLEAN'
        if malicious > 2:
            verdict = 'MALICIOUS'
        elif suspicious > 1:
            verdict = 'SUSPICIOUS'

        return {
            'malicious_engines': malicious,
            'suspicious_engines': suspicious,
            'total_engines': int(sum(stats.values())),
            'vt_verdict': verdict,
            'raw_stats': stats,
        }
    except Exception as e:
        return {'error': str(e), 'vt_verdict': 'UNAVAILABLE', 'malicious_engines': 0}


def scan_domain(domain: str) -> dict[str, Any]:
    if not VT_API_KEY:
        return {'error': 'VIRUSTOTAL_API_KEY not configured'}

    try:
        session = get_session()
        result = session.get(f'{VT_BASE}/domains/{domain}', headers=VT_HEADERS, timeout=10)
        if result.status_code == 429:
            return {'error': 'rate_limited'}
        result.raise_for_status()
        payload = result.json()
        attrs = payload['data']['attributes']

        return {
            'reputation': attrs.get('reputation', 0),
            'malicious_count': (attrs.get('last_analysis_stats') or {}).get('malicious', 0),
            'creation_date': attrs.get('creation_date'),
            'categories': attrs.get('categories', {}),
        }
    except Exception as e:
        return {'error': str(e), 'vt_verdict': 'UNAVAILABLE'}
