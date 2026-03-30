from typing import Optional, Tuple, List
import requests
import math
from models import Point
from fastapi import HTTPException


def haversine_distance(point1: Point, point2: Point) -> float:
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


def get_osrm_distance(point1: Point, point2: Point) -> Optional[float]:
    try:
        coord1 = f"{point1.lon},{point1.lat}"
        coord2 = f"{point2.lon},{point2.lat}"
        url = f"http://router.project-osrm.org/route/v1/driving/{coord1};{coord2}"
        params = {"overview": "false", "annotations": "distance"}
        response = requests.get(url, params=params, timeout=2)
        data = response.json()

        if response.status_code == 200 and data.get("code") == "Ok":
            return data["routes"][0]["distance"]
        return None
    except requests.RequestException:
        return None
    except (KeyError, IndexError):
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
