import os
import logging
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)

PHISHTANK_API_URL = "https://checkurl.phishtank.com/checkurl/"
PHISHTANK_API_KEY = os.environ.get('PHISHTANK_API_KEY', '')

def check_url(url: str) -> Dict[str, Any]:
    """
    Check URL against PhishTank database
    
    Args:
        url: URL to check
        
    Returns:
        Dict with is_phishing, score, and source
    """
    if not PHISHTANK_API_KEY:
        logger.warning('[PhishTank] No API key configured - returning safe')
        return {
            'is_phishing': False,
            'score': 0.0,
            'source': 'unavailable'
        }
    
    try:
        # Prepare the request
        data = {
            'url': url,
            'format': 'json',
            'app_key': PHISHTANK_API_KEY
        }
        
        # Make request with timeout
        response = requests.post(PHISHTANK_API_URL, data=data, timeout=8)
        response.raise_for_status()
        
        result = response.json()
        
        # Parse response
        is_phishing = result.get('in_database', False)
        verified = result.get('verified', False)
        
        # Score based on verification status
        score = 1.0 if is_phishing and verified else 0.0
        
        logger.info(f'[PhishTank] Checked {url}: phishing={is_phishing}, verified={verified}')
        
        return {
            'is_phishing': is_phishing,
            'verified': verified,
            'score': score,
            'source': 'phishtank'
        }
        
    except requests.exceptions.Timeout:
        logger.error(f'[PhishTank] Timeout checking {url}')
        return {
            'is_phishing': False,
            'score': 0.0,
            'source': 'unavailable'
        }
    except requests.exceptions.RequestException as e:
        logger.error(f'[PhishTank] Request failed for {url}: {e}')
        return {
            'is_phishing': False,
            'score': 0.0,
            'source': 'unavailable'
        }
    except Exception as e:
        logger.error(f'[PhishTank] Unexpected error for {url}: {e}')
        return {
            'is_phishing': False,
            'score': 0.0,
            'source': 'unavailable'
        }

if __name__ == '__main__':
    # Test the service
    test_urls = [
        'https://google.com',
        'http://phishing-test.com'
    ]
    
    for url in test_urls:
        result = check_url(url)
        print(f"URL: {url}")
        print(f"Result: {result}")
        print("-" * 50)
