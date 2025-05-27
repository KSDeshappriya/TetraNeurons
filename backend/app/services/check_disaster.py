import geohash as pgh
import time
from typing import List
from firebase_admin import db  

EXCLUDED_KEYS = {
    "gdac_disasters",
    "cnn_analysis",
    "weather_data",
    "citizen_survival_guide",
    "government_report"
}

def get_nearby_disasters(latitude: float, longitude: float) -> List[dict]:
    geohash_prefix = pgh.encode(latitude, longitude, precision=4)
    one_week_ago = int(time.time()) - 7 * 24 * 60 * 60

    snapshot = db.reference("disasters").get()
    results = []

    if not snapshot:
        return results

    for key, disaster in snapshot.items():
        gh = disaster.get("geohash")
        ts = disaster.get("timestamp")

        if not ts:
            try:
                parts = key.split("_")
                ts = int(parts[1]) if len(parts) > 1 else 0
            except:
                continue

        if not gh or not gh.startswith(geohash_prefix) or ts < one_week_ago:
            continue

        cleaned = {k: v for k, v in disaster.items() if k not in EXCLUDED_KEYS}
        cleaned["id"] = key
        cleaned["timestamp"] = ts
        results.append(cleaned)

    return results
