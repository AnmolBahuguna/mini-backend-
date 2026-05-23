from __future__ import annotations
import logging

logger = logging.getLogger(__name__)


def _clamp01(value: float) -> float:
    return max(0.0, min(float(value), 1.0))


def _risk_level_from_drs(drs: float) -> str:
    # 0-2 SAFE | 3-5 LOW | 6-7 MEDIUM | 8-9 HIGH | 10 CRITICAL
    if drs >= 10.0:
        return 'CRITICAL'
    if drs >= 8.0:
        return 'HIGH'
    if drs >= 6.0:
        return 'MEDIUM'
    if drs >= 3.0:
        return 'LOW'
    return 'SAFE'


def calculate_drs(
    vt_result: dict | None = None,
    gsb_result: dict | None = None,
    pt_result: dict | None = None,
    community_reports: int = 0,
    *,
    ipqs_result: dict | None = None,
    abuseip_result: dict | None = None,
    domain_age_days: int | None = None,
    pattern_score: float = 0.0,
) -> dict:
    vt_result = vt_result or {}
    gsb_result = gsb_result or {}
    pt_result = pt_result or {}
    ipqs_result = ipqs_result or {}
    abuseip_result = abuseip_result or {}

    malicious = int(vt_result.get('malicious_engines', 0) or 0)
    suspicious = int(vt_result.get('suspicious_engines', 0) or 0)
    total = int(vt_result.get('total_engines', 0) or 0)
    vt_ratio = (malicious / total) if total > 0 else 0.0
    vt_score = _clamp01(max(vt_ratio * 3.0, (malicious * 0.08) + (suspicious * 0.02)))

    gsb_score = 1.0 if gsb_result.get('is_threat') else 0.0

    pt_score = 1.0 if pt_result.get('verified') else (0.45 if pt_result.get('in_database') else 0.0)

    ipqs_fraud = int(ipqs_result.get('fraud_score', 0) or 0)
    ipqs_score = _clamp01(ipqs_fraud / 100.0)

    abuse_score = int(abuseip_result.get('abuse_score', 0) or 0)
    abuse_norm = _clamp01(abuse_score / 100.0)

    report_score = _clamp01((community_reports or 0) / 50.0)

    if domain_age_days is None:
        domain_age_risk = 0.0
    elif domain_age_days < 30:
        domain_age_risk = 1.0
    elif domain_age_days < 90:
        domain_age_risk = 0.7
    elif domain_age_days < 365:
        domain_age_risk = 0.35
    else:
        domain_age_risk = 0.1

    pattern_norm = _clamp01(pattern_score)

    weighted = (
        vt_score * 0.30 +
        gsb_score * 0.20 +
        ipqs_score * 0.15 +
        abuse_norm * 0.10 +
        domain_age_risk * 0.08 +
        report_score * 0.08 +
        pt_score * 0.04 +
        pattern_norm * 0.05
    )
    drs = round(min(weighted * 10.0, 10.0), 1)

    # Safety rails for hard hits from key providers.
    if gsb_score >= 1.0 and drs < 8.0:
        drs = 8.0
    if malicious >= 5 and drs < 7.0:
        drs = 7.0
    if ipqs_fraud >= 90 and drs < 8.0:
        drs = 8.0
    if abuse_score >= 95 and drs < 8.0:
        drs = 8.0

    risk = _risk_level_from_drs(drs)
    logger.info(
        "[DRS] malicious=%s suspicious=%s total=%s gsb=%s pt=%s ipqs=%s abuse=%s reports=%s age_days=%s pattern=%s => drs=%s risk=%s",
        malicious, suspicious, total, gsb_score, pt_score, ipqs_fraud, abuse_score, community_reports, domain_age_days, pattern_norm, drs, risk
    )
    return {'drs_score': drs, 'risk_level': risk}
