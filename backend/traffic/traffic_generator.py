import csv
import os
from datetime import datetime, timezone, timedelta
from .traffic_patterns import STREETS

TRAFFIC_CSV_PATH = os.getenv("TRAFFIC_CSV_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "..", "osrm-data", "car", "traffic.csv"))

TZ_EKATERINBURG = timezone(timedelta(hours=5))


def get_current_speed(road):
    now = datetime.now(TZ_EKATERINBURG)
    current_hour = now.hour
    current_weekday = now.weekday()

    base_speed = road.get("base_speed", 50)
    speed = base_speed

    for pattern in road.get("patterns", []):
        days = pattern.get("days", [])
        if days and current_weekday not in days:
            continue
        hours = pattern.get("hours", [])
        for start, end in hours:
            if start <= current_hour < end:
                speed = base_speed * pattern.get("factor", 1.0)
                break
        if speed != base_speed:
            break

    return max(5, min(120, speed))


def generate_traffic_csv(output_path=None):
    if output_path is None:
        output_path = TRAFFIC_CSV_PATH

    output_path = os.path.abspath(output_path)
    edges = []

    for road in STREETS:
        speed = get_current_speed(road)
        edges.append([road["from_id"], road["to_id"], int(speed)])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(edges)

    return len(edges)
