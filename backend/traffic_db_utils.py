import psycopg2
import numpy as np
from typing import List
from models import Point

# Параметры подключения к БД (можно вынести в .env)
DB_CONFIG = {
    'host': 'db',
    'database': 'traffic_db',
    'user': 'admin',
    'password': 'mysecret',
}

def fetch_jams_from_db(points: List[Point], radius_m: float = 300) -> list:
    """
    Получить пробки из БД в радиусе radius_m от каждой точки маршрута.
    Возвращает список событий с координатами, уровнем и скоростью (если есть).
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    jams = []
    for p in points:
        cur.execute(
            """
            SELECT id, event_type, latitude, longitude, severity, detected_at
            FROM road_events
            WHERE event_type = 'traffic_jam'
              AND sqrt(power(latitude - %s, 2) + power(longitude - %s, 2)) < %s / 111320.0
              AND expires_at > NOW()
            ORDER BY detected_at DESC
            LIMIT 1
            """,
            (p.lat, p.lon, radius_m)
        )
        row = cur.fetchone()
        if row:
            jams.append({
                'id': row[0],
                'event_type': row[1],
                'lat': row[2],
                'lon': row[3],
                'severity': row[4],
                'detected_at': row[5],
                'point_idx': points.index(p)
            })
    cur.close()
    conn.close()
    return jams

def adjust_matrix_with_jams(matrix: np.ndarray, jams: list, penalty_per_severity: float = 0.2):
    """
    Увеличивает веса (длины) в матрице расстояний для точек с пробками.
    penalty_per_severity — на сколько процентов увеличивать путь за каждый уровень пробки.
    """
    for jam in jams:
        idx = jam['point_idx']
        severity = jam['severity'] or 1
        penalty = 1 + penalty_per_severity * int(severity)
        matrix[idx, :] *= penalty
        matrix[:, idx] *= penalty
    return matrix
