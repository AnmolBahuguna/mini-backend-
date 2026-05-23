from __future__ import annotations

import concurrent.futures
import logging
from datetime import datetime, timezone
from urllib.parse import urlparse

from .abuseipdb import check_ip_reputation
from .drs_calculator import calculate_drs
from .demo_mode import DEMO_MODE, get_demo_result
from .phone_check import check_phone_number
from .phishtank import check_url as check_phishtank
from .safe_browsing import check_url_safe_browsing
from .supabase_client import count_reports_for_entity
from .virustotal import scan_domain, scan_url
from api.ml.phishing_model import PhishingModel

logger = logging.getLogger(__name__)


def _risk_from_score(score: float) -> str:
    if score >= 10.0:
        return 'CRITICAL'
    if score >= 8.0:
        return 'HIGH'
    if score >= 6.0:
        return 'MEDIUM'
    if score >= 3.0:
        return 'LOW'
    return 'SAFE'


def _normalize_url(value: str) -> str:
    """Normalize and validate URL format."""
    s = (value or '').strip()
    
    # Add protocol if missing
    if not s.startswith('http://') and not s.startswith('https://'):
        s = f'http://{s}'
    
    # Validate URL structure
    try:
        parsed = urlparse(s)
        if not parsed.netloc:
            logger.warning(f"URL normalization produced invalid URL: {s}")
    except Exception as e:
        logger.error(f"URL parsing failed for '{value}': {e}")
    
    return s


def _should_use_demo_mode() -> bool:
    """Use demo mode only when all major providers are missing."""
    from decouple import config

    vt_key = config('VIRUSTOTAL_API_KEY', default='').strip()
    gsb_key = config('GOOGLE_SAFE_BROWSING_KEY', default='').strip()
    ipqs_key = config('IPQS_API_KEY', default='').strip()
    abuse_key = config('ABUSEIPDB_API_KEY', default='').strip()
    return not any((vt_key, gsb_key, ipqs_key, abuse_key))


def _safe_future_result(future: concurrent.futures.Future, timeout: int, fallback: dict, log_label: str) -> dict:
    try:
        logger.info("[Analyzer] Calling %s", log_label)
        value = future.result(timeout=timeout)
        logger.info("[Analyzer] %s response: %s", log_label, value)
        return value if isinstance(value, dict) else fallback
    except concurrent.futures.TimeoutError:
        logger.warning("%s timed out", log_label)
        return fallback
    except Exception as exc:
        logger.error("%s failed: %s", log_label, exc)
        out = dict(fallback)
        out['error'] = str(exc)
        return out


def _domain_age_days(creation_date: int | None) -> int | None:
    if not creation_date:
        return None
    try:
        dt = datetime.fromtimestamp(int(creation_date), tz=timezone.utc)
        return max((datetime.now(timezone.utc) - dt).days, 0)
    except Exception:
        return None


def analyze_entity(entity: str, entity_type: str) -> dict:
    logger.info("[Analyzer] INPUT ENTITY: %s", entity)
    logger.info("[Analyzer] ENTITY TYPE: %s", entity_type)
    # Use demo mode if enabled or if API keys are missing
    if DEMO_MODE or _should_use_demo_mode():
        logger.info("[Analyzer] Demo mode active for %s", entity)
        return get_demo_result(entity, entity_type)
    
    results: dict = {}
    drs_score = 0.0
    risk_level = 'LOW'
    scam_type = 'Unknown'
    reports_count = 0

    if entity_type in ('url', 'domain'):
        url = _normalize_url(entity)
        domain_name = urlparse(url).hostname or entity
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            vt_future = executor.submit(scan_url, url)
            gsb_future = executor.submit(check_url_safe_browsing, url)
            pt_future = executor.submit(check_phishtank, url)
            domain_future = executor.submit(scan_domain, domain_name)

            results['virustotal'] = _safe_future_result(
                vt_future, 15, {'malicious_engines': 0, 'suspicious_engines': 0, 'total_engines': 0, 'vt_verdict': 'TIMEOUT'},
                f"VirusTotal({url})"
            )
            results['safe_browsing'] = _safe_future_result(
                gsb_future, 15, {'is_threat': False, 'gsb_verdict': 'TIMEOUT'},
                f"SafeBrowsing({url})"
            )
            results['phishtank'] = _safe_future_result(
                pt_future, 15, {'in_database': False, 'verified': False, 'phishtank_verdict': 'TIMEOUT'},
                f"PhishTank({url})"
            )
            results['domain_intel'] = _safe_future_result(
                domain_future, 15, {'creation_date': None, 'reputation': 0, 'malicious_count': 0},
                f"DomainIntel({domain_name})"
            )

        reports_count = count_reports_for_entity(entity)
        age_days = _domain_age_days(results.get('domain_intel', {}).get('creation_date'))
        logger.info("[Analyzer] API RESULTS: %s", results)
        drs_result = calculate_drs(
            results.get('virustotal'),
            results.get('safe_browsing'),
            results.get('phishtank'),
            reports_count,
            domain_age_days=age_days,
            pattern_score=0.4 if entity_type == 'domain' and age_days is not None and age_days < 90 else 0.0,
        )
        drs_score = drs_result['drs_score']
        risk_level = drs_result['risk_level']
        logger.info("[Analyzer] DRS SCORE: %s", drs_score)

        if results.get('safe_browsing', {}).get('threat_type') == 'SOCIAL_ENGINEERING':
            scam_type = 'Phishing'
        elif results.get('virustotal', {}).get('vt_verdict') == 'MALICIOUS':
            scam_type = 'Malware'
        elif results.get('phishtank', {}).get('verified'):
            scam_type = 'Phishing'

        # VirusTotal rate-limit fallback policy
        if results.get('virustotal', {}).get('vt_verdict') == 'RATE_LIMIT':
            gsb_score = 1.0 if results.get('safe_browsing', {}).get('is_threat') else 0.0
            pt_score = 1.0 if results.get('phishtank', {}).get('verified') else (0.4 if results.get('phishtank', {}).get('in_database') else 0.0)
            drs_score = round(min(((gsb_score * 0.5 + pt_score * 0.5) * 10.0), 10.0), 1)
            risk_level = calculate_drs(
                {'malicious_engines': 0, 'suspicious_engines': 0, 'total_engines': 0},
                {'is_threat': bool(gsb_score)},
                {'verified': bool(pt_score >= 1.0), 'in_database': bool(pt_score >= 0.4)},
                reports_count,
            )['risk_level']

    elif entity_type in ('email', 'upi', 'message'):
        # Non-URL entities: use local heuristic model + community reports.
        model = PhishingModel()
        pred = model.predict(entity)
        results['phishing_model'] = pred

        reports_count = count_reports_for_entity(entity)
        pattern_score = float(pred.get('confidence', 0.0) or 0.0)
        strong_indicator = False
        medium_indicator = False
        if entity_type == 'email':
            if any(k in entity.lower() for k in ('verify', 'secure', 'support', 'login', 'update', 'amaz0n', 'paytm', 'bank')):
                pattern_score = max(pattern_score, 0.75)
                medium_indicator = True
        elif entity_type == 'upi':
            if any(k in entity.lower() for k in ('reward', 'cash', 'claim', 'offer', 'win', 'scammer')):
                pattern_score = max(pattern_score, 0.8)
                strong_indicator = True
            else:
                pattern_score = max(pattern_score, 0.45)
        elif entity_type == 'message':
            lower = entity.lower()
            if any(k in lower for k in ('otp', 'kyc', 'click', 'prize', 'lottery', 'urgent', 'verify', 'account blocked', 'refund')):
                pattern_score = max(pattern_score, 0.95)
                strong_indicator = True
            elif any(k in lower for k in ('bank', 'payment', 'upi', 'security', 'suspend', 'limited time')):
                pattern_score = max(pattern_score, 0.65)
                medium_indicator = True
        drs_result = calculate_drs(
            community_reports=reports_count,
            pattern_score=pattern_score,
        )
        logger.info("[Analyzer] API RESULTS: %s", results)
        drs_score = drs_result['drs_score']
        risk_level = drs_result['risk_level']
        logger.info("[Analyzer] DRS SCORE: %s", drs_score)

        # Safety rails for text/identifier scans where external intel is sparse.
        if entity_type == 'message':
            if strong_indicator and drs_score < 6.0:
                drs_score = 6.0
            elif medium_indicator and drs_score < 4.0:
                drs_score = 4.0
        elif entity_type == 'upi':
            if strong_indicator and drs_score < 6.0:
                drs_score = 6.0
            elif drs_score < 2.5:
                drs_score = 2.5
        elif entity_type == 'email' and medium_indicator and drs_score < 4.0:
            drs_score = 4.0

        risk_level = _risk_from_score(drs_score)

        scam_type = 'Phishing/Social Engineering' if pred.get('is_phishing') else 'Unknown'

    elif entity_type in ('phone',):
        try:
            results['ipqs'] = check_phone_number(entity)
            reports_count = count_reports_for_entity(entity)
            drs_result = calculate_drs(
                community_reports=reports_count,
                ipqs_result=results.get('ipqs'),
                pattern_score=0.35 if results.get('ipqs', {}).get('risky') else 0.0,
            )
            logger.info("[Analyzer] API RESULTS: %s", results)
            drs_score = drs_result['drs_score']
            risk_level = drs_result['risk_level']
            logger.info("[Analyzer] DRS SCORE: %s", drs_score)
            scam_type = 'Vishing/Phone Scam' if results.get('ipqs', {}).get('risky') else 'Unknown'
        except Exception as e:
            # Handle any unexpected errors gracefully
            results['ipqs'] = {'error': f'Processing failed: {str(e)[:50]}', 'verdict': 'ERROR'}
            drs_score = 0.5
            risk_level = 'LOW'
            scam_type = 'Unknown'

    elif entity_type in ('ip',):
        try:
            results['abuseipdb'] = check_ip_reputation(entity)
            reports_count = count_reports_for_entity(entity)
            drs_result = calculate_drs(
                community_reports=reports_count,
                abuseip_result=results.get('abuseipdb'),
            )
            logger.info("[Analyzer] API RESULTS: %s", results)
            drs_score = drs_result['drs_score']
            risk_level = drs_result['risk_level']
            logger.info("[Analyzer] DRS SCORE: %s", drs_score)
            scam_type = 'Malicious IP' if results.get('abuseipdb', {}).get('verdict') == 'MALICIOUS' else 'Unknown'
        except Exception as e:
            # Handle any unexpected errors gracefully
            results['abuseipdb'] = {'error': f'Processing failed: {str(e)[:50]}', 'verdict': 'ERROR'}
            drs_score = 0.5
            risk_level = 'LOW'
            scam_type = 'Unknown'

    output = {
        'entity': entity,
        'entity_type': entity_type,
        'drs_score': drs_score,
        'risk_level': risk_level,
        'scam_type': scam_type,
        'reports_count': reports_count,
        'geo_tags': [],
        'api_results': results,
        'ai_summary': None,
        'status': 'completed',
    }
    logger.info("[Analyzer] Final output for %s(%s): %s", entity, entity_type, output)
    return output
