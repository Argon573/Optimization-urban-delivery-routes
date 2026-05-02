import psycopg2
from datetime import datetime, timedelta
import random

def save_events():
    conn = psycopg2.connect(
        host="db",
        database="traffic_db",
        user="admin",
        password="mysecret"
    )
    cur = conn.cursor()
    
    # Очищаем старые
    cur.execute("DELETE FROM road_events WHERE expires_at < NOW()")
    
    # Демо-события (имитируем пробку и ДТП)
    demo_events = [
        {
            "type": "traffic_jam",
            "title": "Пробка на Ленина (имитация)",
            "lat": 56.8381,
            "lon": 60.6001,
            "severity": 3,
            "distance_m": 200,
            "source": "demo"
        },
        {
            "type": "accident",
            "title": "ДТП на Московской (имитация)",
            "lat": 56.8300,
            "lon": 60.5900,
            "severity": None,
            "distance_m": 450,
            "source": "demo"
        }
    ]
    
    for e in demo_events:
        cur.execute("""
            INSERT INTO road_events 
            (event_type, title, latitude, longitude, severity, distance_m, source, expires_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            e['type'], e['title'],
            e['lat'], e['lon'],
            e['severity'], e['distance_m'], e['source'],
            datetime.now() + timedelta(hours=2)
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"[{datetime.now()}] Добавлено демо-событий: {len(demo_events)}")

if __name__ == "__main__":
    save_events()