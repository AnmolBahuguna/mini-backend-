from __future__ import annotations
import logging

logger = logging.getLogger(__name__)

class DRSModel:
    """Unified rule-based Digital Risk Score (DRS) Calculator."""

    def predict(self, features: dict) -> float:
        """
        Calculates a DRS score from 0.0 to 10.0 based on 6 factors.
        Keys: ml_score, virustotal, gsb, phishtank, ipqs, pattern.
        """
        try:
            # 1. ML Score (w=0.15)
            ml_score = float(features.get('ml_score', 0.0))
            ml_comp = min(max(ml_score, 0.0), 1.0) * 0.15
            
            # 2. VirusTotal (w=0.25)
            vt_comp = 0.0
            vt = features.get('virustotal', {})
            malicious = int(vt.get('malicious_engines', 0) or 0)
            if malicious >= 10: vt_comp = 0.25
            elif malicious >= 3: vt_comp = 0.15
            elif malicious >= 1: vt_comp = 0.05
            
            # 3. Google Safe Browsing (w=0.20)
            gsb = features.get('gsb', {})
            gsb_comp = 0.20 if gsb.get('is_threat') else 0.0
            
            # 4. PhishTank (w=0.15)
            pt = features.get('phishtank', {})
            pt_comp = 0.15 if pt.get('verified') else 0.0
            
            # 5. IPQS / AbuseIPDB (w=0.15)
            ipqs = features.get('ipqs', {})
            fraud_score = float(ipqs.get('fraud_score', 0) or 0) / 100.0
            ipqs_comp = min(max(fraud_score, 0.0), 1.0) * 0.15

            # 6. Pattern Confidence (w=0.10)
            pattern = float(features.get('pattern', 0.0))
            pattern_comp = min(max(pattern, 0.0), 1.0) * 0.10

            total = (ml_comp + vt_comp + gsb_comp + pt_comp + ipqs_comp + pattern_comp) * 10.0
            return round(max(0.0, min(10.0, total)), 1)
            
        except Exception as e:
            logger.error(f"DRS calculation error: {e}")
            return 0.0

if __name__ == "__main__":
    model = DRSModel()
    print("Testing DRSModel...")
    test_cases = [
        {"name": "All Zeros", "features": {}},
        {"name": "All Max", "features": {"ml_score": 1.0, "virustotal": {"malicious_engines": 15}, "gsb": {"is_threat": True}, "phishtank": {"verified": True}, "ipqs": {"fraud_score": 100}, "pattern": 1.0}},
        {"name": "Mixed", "features": {"ml_score": 0.8, "virustotal": {"malicious_engines": 4}, "gsb": {"is_threat": False}, "phishtank": {"verified": False}, "ipqs": {"fraud_score": 40}, "pattern": 0.5}}
    ]
    for case in test_cases:
        res = model.predict(case['features'])
        print(f"{case['name']} -> {res}")

