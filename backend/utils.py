import os
from typing import Optional, Tuple, List, Dict

import numpy as np
import math
import requests
from functools import lru_cache
from fastapi import HTTPException

from models import Point, TransportProfile


OSRM_CAR_URL = os.getenv("OSRM_CAR_URL", "http://localhost:5000")
OSRM_BIKE_URL = os.getenv("OSRM_BIKE_URL", "http://localhost:5001")
OSRM_FOOT_URL = os.getenv("OSRM_FOOT_URL", "http://localhost:5002")


def osrm_profile_for_transport(transport: TransportProfile) -> str:
    mapping = {
        TransportProfile.CAR: "driving",
        TransportProfile.WALKING: "walking",
        TransportProfile.TRANSIT: "walking",
    }
    return mapping[transport]


def haversine_distance(point1: Point, point2: Point) -> float:
    R = 6371000
    lat1, lat2 = math.radians(point1.lat), math.radians(point2.lat)
    lon1, lon2 = math.radians(point1.lon), math.radians(point2.lon)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def haversine_distance_vectorized(points: List[Point]) -> np.ndarray:
    n = len(points)
    lats = np.radians(np.array([p.lat for p in points], dtype=np.float64))
    lons = np.radians(np.array([p.lon for p in points], dtype=np.float64))

    dlats = lats[:, np.newaxis] - lats[np.newaxis, :]
    dlons = lons[:, np.newaxis] - lons[np.newaxis, :]

    a = np.sin(dlats / 2) ** 2 + np.cos(lats[:, np.newaxis]) * np.cos(lats[np.newaxis, :]) * np.sin(dlons / 2) ** 2
    return 6371000 * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def geocode_address(city: Optional[str], street: Optional[str], house: Optional[str]) -> Optional[Tuple[float, float]]:
    if not city or not street:
        return None

    headers = {"User-Agent": "backend-routemapper/1.0"}

    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "street": f"{street} {house}".strip() if house else street,
            "city": city,
            "countrycodes": "ru",
            "format": "json",
            "limit": 5,
            "addressdetails": 1,
        }
        response = requests.get(url, params=params, timeout=3, headers=headers)
        response.raise_for_status()
        data = response.json()

        if data:
            city_lower = city.strip().lower()
            street_lower = street.strip().lower()
            for result in data:
                addr = result.get("address", {})
                result_city = (addr.get("city") or addr.get("town") or addr.get("village") or "").lower()
                result_road = (addr.get("road") or "").lower()
                if (street_lower in result_road or result_road in street_lower) and \
                   (result_city == city_lower or city_lower in result_city):
                    return float(result["lat"]), float(result["lon"])
            for result in data:
                addr = result.get("address", {})
                result_city = (addr.get("city") or addr.get("town") or addr.get("village") or "").lower()
                if result_city == city_lower or city_lower in result_city:
                    return float(result["lat"]), float(result["lon"])
    except requests.exceptions.RequestException:
        pass

    try:
        address = f"{city}, {street}"
        if house:
            address = f"{address} {house}"
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": address, "format": "json", "limit": 5, "countrycodes": "ru"},
            timeout=3, headers=headers,
        )
        response.raise_for_status()
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except requests.exceptions.RequestException:
        pass

    return None


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


def _osrm_base_url(profile: str) -> str:
    if profile == "walking":
        return OSRM_FOOT_URL
    elif profile == "cycling":
        return OSRM_BIKE_URL
    return OSRM_CAR_URL


@lru_cache(maxsize=512)
def get_osrm_route_info(point1_key: str, point2_key: str, transport: str = "driving") -> Optional[Dict[str, float]]:
    base_url = _osrm_base_url(transport)
    try:
        url = f"{base_url}/route/v1/{transport}/{point2_key};{point1_key}"
        resp = requests.get(url, params={"overview": "false", "annotations": "duration"}, timeout=5)
        data = resp.json()
        if resp.status_code == 200 and data.get("code") == "Ok":
            route = data["routes"][0]
            return {"distance": route["distance"], "duration": route["duration"]}
    except Exception:
        pass
    return None


def get_osrm_distance_wrapper(point1: Point, point2: Point, transport: str = "driving") -> Optional[float]:
    p1_key = f"{point1.lon},{point1.lat}"
    p2_key = f"{point2.lon},{point2.lat}"
    info = get_osrm_route_info(p1_key, p2_key, transport)
    return info["distance"] if info else None


def get_osrm_duration_wrapper(point1: Point, point2: Point, transport: str = "driving") -> Optional[float]:
    p1_key = f"{point1.lon},{point1.lat}"
    p2_key = f"{point2.lon},{point2.lat}"
    info = get_osrm_route_info(p1_key, p2_key, transport)
    return info["duration"] if info else None


def get_osrm_route_geometry(coords: str, profile: str = "driving") -> Optional[list]:
    base_url = _osrm_base_url(profile)
    try:
        resp = requests.get(
            f"{base_url}/route/v1/{profile}/{coords}",
            params={"overview": "full", "geometries": "geojson"},
            timeout=10,
        )
        data = resp.json()
        if resp.status_code == 200 and data.get("code") == "Ok":
            return data["routes"][0]["geometry"]["coordinates"]
    except Exception:
        pass
    return None
