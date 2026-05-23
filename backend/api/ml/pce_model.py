from __future__ import annotations


class PatternConfidenceEngine:
    def calculate_confidence(self, reports: list, api_results: dict) -> float:
        if not reports:
            return 0.0

        try:
            unique_reporters = len(set(r.get('reporter_id', '') for r in reports if isinstance(r, dict)))
            source_diversity = min(unique_reporters / max(len(reports), 1), 1.0)

            districts = set(r.get('district', '') for r in reports if isinstance(r, dict) and r.get('district'))
            geo_spread = min(len(districts) / 10, 1.0)

            api_agree = 0
            if isinstance(api_results, dict):
                if api_results.get('virustotal', {}).get('vt_verdict') in ('MALICIOUS', 'SUSPICIOUS'):
                    api_agree += 1
                if api_results.get('safe_browsing', {}).get('is_threat'):
                    api_agree += 1
                if api_results.get('phishtank', {}).get('verified'):
                    api_agree += 1
            api_agreement = api_agree / 3.0

            velocity = min(len(reports[-10:]) / 5, 1.0)

            confidence = (
                source_diversity * 0.35 +
                geo_spread * 0.25 +
                api_agreement * 0.30 +
                velocity * 0.10
            )

            return round(confidence, 2)
        except Exception:
            return 0.0

if __name__ == "__main__":
    model = PatternConfidenceEngine()
    print("Testing PatternConfidenceEngine...")
    test_reports = [
        {"reporter_id": "u1", "district": "Mumbai", "state": "MH"},
        {"reporter_id": "u2", "district": "Pune", "state": "MH"}
    ]
    test_api = {"virustotal": {"vt_verdict": "MALICIOUS"}}
    res = model.calculate_confidence(test_reports, test_api)
    print(f"Confidence score: {res}")

