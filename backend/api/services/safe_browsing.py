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

GSB_KEY = config('GOOGLE_SAFE_BROWSING_KEY', default='')


def check_url_safe_browsing(url: str) -> dict:
    if not GSB_KEY:
        return {'error': 'GOOGLE_SAFE_BROWSING_KEY not configured', 'is_threat': False, 'gsb_verdict': 'UNAVAILABLE'}

    endpoint = f'https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GSB_KEY}'

    payload = {
        'client': {'clientId': 'dhip-platform', 'clientVersion': '1.0.0'},
        'threatInfo': {
            'threatTypes': [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'UNWANTED_SOFTWARE',
                'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            'platformTypes': ['ANY_PLATFORM'],
            'threatEntryTypes': ['URL'],
            'threatEntries': [{'url': url}],
        },
    }

    try:
        session = get_session()
        response = session.post(endpoint, json=payload, timeout=8)
        data = response.json() if response.content else {}

        matches = data.get('matches') or []
        if matches:
            threat_type = matches[0].get('threatType')
            return {
                'is_threat': True,
                'threat_type': threat_type,
                'gsb_verdict': (
                    'PHISHING' if threat_type == 'SOCIAL_ENGINEERING'
                    else 'MALWARE' if threat_type == 'MALWARE'
                    else 'UNSAFE'
                ),
            }

        return {'is_threat': False, 'gsb_verdict': 'CLEAN'}
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"GSB Error: {e}")
        return {'is_threat': False, 'gsb_verdict': 'UNAVAILABLE'}
