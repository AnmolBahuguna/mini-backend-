"""
Demo/Mock mode for threat analyzer - for testing without real API keys.
"""
import os
from typing import Any

DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'

def get_demo_result(entity: str, entity_type: str) -> dict[str, Any]:
    """Returns demo/mock threat data for testing."""
    entity_lower = entity.lower()
    
    # Known phishing URLs
    phishing_urls = [
        'pay-sbi-secure.xyz', 'evil-bank.com', 'amazon-verify.com',
        'secure-login-paypal.com', 'www.go0gle.com'
    ]
    
    if entity_type in ('url', 'domain'):
        # Check if it's a known phishing URL
        is_phishing = any(phishing in entity_lower for phishing in phishing_urls)
        
        if is_phishing:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 8.5,
                'risk_level': 'HIGH',
                'scam_type': 'Phishing',
                'reports_count': 23,
                'api_results': {
                    'virustotal': {
                        'malicious_engines': 15,
                        'suspicious_engines': 8,
                        'total_engines': 73,
                        'vt_verdict': 'MALICIOUS'
                    },
                    'safe_browsing': {
                        'is_threat': True,
                        'threat_type': 'SOCIAL_ENGINEERING',
                        'gsb_verdict': 'PHISHING'
                    },
                    'phishtank': {
                        'in_database': True,
                        'verified': True,
                        'phishtank_verdict': 'PHISHING'
                    }
                },
                'status': 'completed',
                'demo': True
            }
        else:
            # Safe URL
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 0.5,
                'risk_level': 'LOW',
                'scam_type': 'Unknown',
                'reports_count': 0,
                'api_results': {
                    'virustotal': {
                        'malicious_engines': 0,
                        'suspicious_engines': 0,
                        'total_engines': 73,
                        'vt_verdict': 'CLEAN'
                    },
                    'safe_browsing': {
                        'is_threat': False,
                        'gsb_verdict': 'CLEAN'
                    },
                    'phishtank': {
                        'in_database': False,
                        'verified': False,
                        'phishtank_verdict': 'CLEAN'
                    }
                },
                'status': 'completed',
                'demo': True
            }
    
    elif entity_type == 'phone':
        # Sample suspicious phone numbers
        suspicious_phones = ['9123456789', '9876543210', '8765432109']
        is_suspicious = any(phone in entity.replace(' ', '').replace('-', '') for phone in suspicious_phones)
        
        if is_suspicious:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 7.2,
                'risk_level': 'HIGH',
                'scam_type': 'Vishing/Phone Scam',
                'reports_count': 15,
                'api_results': {
                    'ipqs': {
                        'fraud_score': 85,
                        'risky': True,
                        'verdict': 'HIGH_RISK'
                    }
                },
                'status': 'completed',
                'demo': True
            }
        else:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 1.0,
                'risk_level': 'LOW',
                'scam_type': 'Unknown',
                'reports_count': 0,
                'api_results': {
                    'ipqs': {
                        'fraud_score': 5,
                        'risky': False,
                        'verdict': 'SAFE'
                    }
                },
                'status': 'completed',
                'demo': True
            }
    
    elif entity_type in ('email', 'upi'):
        # Suspicious emails/UPI
        suspicious_patterns = [
            'cashprize', 'lottery', 'prize', 'hr.infosys.jobs',
            'verify', 'confirm', 'urgent', 'immediate'
        ]
        is_suspicious = any(pattern in entity_lower for pattern in suspicious_patterns)
        
        if is_suspicious:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 6.8,
                'risk_level': 'HIGH' if 'cashprize' in entity_lower or 'lottery' in entity_lower else 'MEDIUM',
                'scam_type': 'Phishing/Social Engineering',
                'reports_count': 12,
                'api_results': {
                    'phishing_model': {
                        'is_phishing': True,
                        'confidence': 82
                    }
                },
                'status': 'completed',
                'demo': True
            }
        else:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 0.8,
                'risk_level': 'LOW',
                'scam_type': 'Unknown',
                'reports_count': 0,
                'api_results': {
                    'phishing_model': {
                        'is_phishing': False,
                        'confidence': 5
                    }
                },
                'status': 'completed',
                'demo': True
            }
    
    elif entity_type == 'message':
        # Check for suspicious patterns
        suspicious_msg_patterns = [
            'won', 'prize', 'claim', 'urgent', 'immediately',
            'verify', 'confirm', 'bank', 'account', 'password'
        ]
        is_suspicious = any(pattern in entity_lower for pattern in suspicious_msg_patterns)
        
        if is_suspicious:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 7.5,
                'risk_level': 'HIGH',
                'scam_type': 'Phishing/Social Engineering',
                'reports_count': 45,
                'api_results': {
                    'phishing_model': {
                        'is_phishing': True,
                        'confidence': 88
                    }
                },
                'status': 'completed',
                'demo': True
            }
        else:
            return {
                'entity': entity,
                'entity_type': entity_type,
                'drs_score': 1.2,
                'risk_level': 'LOW',
                'scam_type': 'Unknown',
                'reports_count': 0,
                'api_results': {
                    'phishing_model': {
                        'is_phishing': False,
                        'confidence': 8
                    }
                },
                'status': 'completed',
                'demo': True
            }
    
    # Default fallback
    return {
        'entity': entity,
        'entity_type': entity_type,
        'drs_score': 2.0,
        'risk_level': 'LOW',
        'scam_type': 'Unknown',
        'reports_count': 0,
        'api_results': {},
        'status': 'completed',
        'demo': True
    }
