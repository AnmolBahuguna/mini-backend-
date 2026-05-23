from .ipqs import check_phone_number as ipqs_check_phone

def check_phone_number(phone: str) -> dict:
    """Wrapper for IPQS phone validation"""
    return ipqs_check_phone(phone)
