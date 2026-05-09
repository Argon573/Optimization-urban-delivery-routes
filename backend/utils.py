from typing import Optional, Tuple, List
import requests
import math
import numpy as np
from functools import lru_cache
from models import Point
from fastapi import HTTPException


def haversine_distance(point1: Point, point2: Point) -> float:
    """Быстрый расчет расстояния между двумя точками."""
    R = 6371000
    lat1 = math.radians(point1.lat)
    lat2 = math.radians(point2.lat)
    lon1 = math.radians(point1.lon)
    lon2 = math.radians(point2.lon)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def haversine_distance_vectorized(points: List[Point]) -> np.ndarray:
    """Векторизованный расчет матрицы расстояний через NumPy (в 50+ раз быстрее)."""
    n = len(points)
    lats = np.array([p.lat for p in points], dtype=np.float64)
    lons = np.array([p.lon for p in points], dtype=np.float64)
    
    # Переводим в радианы
    lats_rad = np.radians(lats)
    lons_rad = np.radians(lons)
    
    # Создаем матрицы разниц
    dlats = lats_rad[:, np.newaxis] - lats_rad[np.newaxis, :]
    dlons = lons_rad[:, np.newaxis] - lons_rad[np.newaxis, :]
    
    # Формула Haversine
    a = np.sin(dlats / 2) ** 2 + np.cos(lats_rad[:, np.newaxis]) * np.cos(lats_rad[np.newaxis, :]) * np.sin(dlons / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    R = 6371000
    
    return R * c


def geocode_address(city: Optional[str], street: Optional[str], house: Optional[str]) -> Optional[Tuple[float, float]]:
    if not city or not street:
        return None

    address = f"{city}, {street}"
    if house:
        address = f"{address} {house}"

    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": address, "format": "json", "limit": 1}
        headers = {"User-Agent": "backend-routemapper/1.0"}
        response = requests.get(url, params=params, timeout=3, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data and isinstance(data, list) and len(data) > 0:
            first = data[0]
            return float(first["lat"]), float(first["lon"])
    except requests.exceptions.RequestException:
        return None

    return None


import os

OSRM_CAR_URL = os.getenv("OSRM_CAR_URL", "http://localhost:5000")
OSRM_BIKE_URL = os.getenv("OSRM_BIKE_URL", "http://localhost:5001")
OSRM_FOOT_URL = os.getenv("OSRM_FOOT_URL", "http://localhost:5002")

@lru_cache(maxsize=512)
def get_osrm_distance(point1_key: str, point2_key: str, transport: str = "driving") -> Optional[float]:
    # Выбираем URL в зависимости от типа транспорта
    if transport == "walking":
        base_url = OSRM_FOOT_URL
        profile = "walking"
    elif transport == "cycling":
        base_url = OSRM_BIKE_URL
        profile = "cycling"
    else:  # driving
        base_url = OSRM_CAR_URL
        profile = "driving"

    try:
        url = f"{base_url}/route/v1/{profile}/{point2_key};{point1_key}"
        params = {"overview": "false", "annotations": "distance"}
        response = requests.get(url, params=params, timeout=5)
        data = response.json()

        if response.status_code == 200 and data.get("code") == "Ok":
            return data["routes"][0]["distance"]
        return None
    except:
        return None

def get_osrm_distance_wrapper(point1: Point, point2: Point, transport: str = "driving") -> Optional[float]:
    """Обертка для работы с объектами Point."""
    p1_key = f"{point1.lon},{point1.lat}"
    p2_key = f"{point2.lon},{point2.lat}"
    return get_osrm_distance(p1_key, p2_key, transport=transport)


def sort_points_by_street_coordinates(points: List[Point]) -> List[Point]:
    return sorted(
        points,
        key=lambda p: (
            (p.street or "").strip().lower(),
            p.lat if p.lat is not None else 0.0,
            p.lon if p.lon is not None else 0.0,
            p.id if p.id is not None else 0,
        ),
    )


def resolve_points_with_coordinates(points: List[Point]) -> List[Point]:
    resolved = []
    for i, p in enumerate(points):
        if p.id is None:
            p.id = i

        if p.lat is not None and p.lon is not None:
            resolved.append(p)
            continue

        coords = geocode_address(p.city, p.street, p.house)
        if coords:
            p.lat, p.lon = coords
            resolved.append(p)
            continue

        raise HTTPException(
            status_code=400,
            detail=f"Для точки id={p.id} нет координат и недостаточно данных для геокодинга",
        )

    return resolved
