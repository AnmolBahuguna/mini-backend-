from __future__ import annotations

from datetime import datetime, timedelta
import math

from dateutil.parser import isoparse


class TMDModel:
    """Lightweight DBSCAN-like clustering without heavy native deps."""

    def _euclidean(self, a: list[float], b: list[float]) -> float:
        return math.sqrt(sum((ax - bx) ** 2 for ax, bx in zip(a, b)))

    def _region_hash(self, value: str) -> float:
        return (abs(hash(value)) % 1000) / 1000.0

    def detect_mutations(self, reports: list[dict]) -> list[dict]:
        if not reports:
            return []

        points: list[list[float]] = []
        meta: list[dict] = []
        now = datetime.utcnow()

        for r in reports:
            created_at = r.get('created_at')
            state = r.get('state') or ''
            scam_type = r.get('scam_type') or 'Unknown'
            if not created_at:
                continue

            try:
                ts = isoparse(created_at)
            except Exception:
                continue

            age_hours = (now - ts.replace(tzinfo=None)).total_seconds() / 3600.0
            if age_hours < 0:
                age_hours = 0

            points.append([age_hours, self._region_hash(state), self._region_hash(scam_type)])
            meta.append({'state': state, 'scam_type': scam_type, 'ts': ts})

        if len(points) < 10:
            return []

        # Normalize age dimension to [0,1]
        max_age = max(p[0] for p in points) or 1.0
        for p in points:
            p[0] = p[0] / max_age

        eps = 0.15
        min_samples = 3
        labels = [-2] * len(points)  # -2 = unvisited, -1 = noise
        cluster_id = 0

        for i in range(len(points)):
            if labels[i] != -2:
                continue

            neighbors = [j for j, pt in enumerate(points) if self._euclidean(points[i], pt) <= eps]
            if len(neighbors) < min_samples:
                labels[i] = -1
                continue

            # Start new cluster
            labels[i] = cluster_id
            queue = [n for n in neighbors if n != i]

            while queue:
                j = queue.pop()
                if labels[j] == -1:
                    labels[j] = cluster_id
                if labels[j] != -2:
                    continue
                labels[j] = cluster_id
                j_neighbors = [k for k, pt in enumerate(points) if self._euclidean(points[j], pt) <= eps]
                if len(j_neighbors) >= min_samples:
                    queue.extend([k for k in j_neighbors if labels[k] in (-1, -2)])

            cluster_id += 1

        clusters: dict[int, list[int]] = {}
        for idx, label in enumerate(labels):
            if label == -1:
                continue
            clusters.setdefault(label, []).append(idx)

        out: list[dict] = []
        for label, idxs in clusters.items():
            states = [meta[i]['state'] for i in idxs if meta[i]['state']]
            scam_types = [meta[i]['scam_type'] for i in idxs]
            state = max(set(states), key=states.count) if states else ''
            scam_type = max(set(scam_types), key=scam_types.count) if scam_types else 'Unknown'

            out.append({
                'cluster_id': int(label),
                'scam_type': scam_type,
                'predicted_variant': f'{scam_type} mutation cluster',
                'confidence': round(min(0.5 + (len(idxs) / 50.0), 0.95), 2),
                'state': state,
                'prediction_date': now.isoformat(),
                'valid_until': (now + timedelta(days=7)).isoformat(),
            })

        return out

if __name__ == "__main__":
    model = TMDModel()
    print("Testing TMDModel...")
    now = datetime.utcnow()
    test_reports = [
        {"created_at": (now - timedelta(hours=1)).isoformat(), "state": "Delhi", "scam_type": "Phishing"}
    ] * 12
    res = model.detect_mutations(test_reports)
    print(f"Detected {len(res)} clusters:")
    for cluster in res:
        print(cluster)

