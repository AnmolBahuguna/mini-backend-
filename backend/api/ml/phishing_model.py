from __future__ import annotations

import re


class PhishingModel:
    """Heuristic fallback for phishing detection.

    PRD mentions RandomForest+BERT; this module provides a runtime-safe
    interface that can later be replaced with a trained model artifact.
    """

    SUSPICIOUS_TOKENS = re.compile(r'(login|verify|bank|upi|paytm|sbi|otp|refund|kyc|password)', re.I)

    def predict(self, text: str) -> dict:
        import logging
        logger = logging.getLogger(__name__)
        try:
            s = (text or '').strip()
            if not s:
                return {'is_phishing': False, 'confidence': 0.0}

            score = 0
            if 'http' in s or 'www.' in s:
                score += 25
            if self.SUSPICIOUS_TOKENS.search(s):
                score += 45
            if re.search(r'\b(\.xyz|\.top|\.click|\.icu)\b', s, re.I):
                score += 25
            if re.search(r'@\w+$', s):
                score += 20  # UPI-like

            confidence = min(score, 100) / 100.0
            return {'is_phishing': confidence >= 0.6, 'confidence': confidence}
        except Exception as e:
            logger.error(f"PhishingModel error: {e}")
            return {'is_phishing': False, 'confidence': 0.5}

if __name__ == "__main__":
    model = PhishingModel()
    print("Testing PhishingModel...")
    test_inputs = [
        "Please login to verify your bank account details",
        "Hello friend, how are you?",
        None,
        ""
    ]
    for text in test_inputs:
        print(f"Input: '{text}' -> {model.predict(text)}")
