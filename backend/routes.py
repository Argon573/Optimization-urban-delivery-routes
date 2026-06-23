import json
import math
import random

import requests
from fastapi import APIRouter, HTTPException, Query, Query as FastAPIQuery
from fastapi.responses import Response

from models import (
    GenerateRequest,
    GenerateResponse,
    RouteRequest,
    RouteResponse,
    OptimizedRouteResponse,
    AddressRequest,
    TransportProfile,
    Point,
)
from services import (
    calculate_distance_matrix,
    calculate_weight_matrix,
    calculate_route_distance,
    nearest_neighbor_route,
    two_opt,
    optimize_route_advanced,
    prepare_route_points,
)
from utils import (
    resolve_points_with_coordinates,
    osrm_profile_for_transport,
    get_osrm_route_geometry,
    geocode_address,
)
from traffic.traffic_generator import generate_traffic_csv, get_current_speed
from traffic.traffic_patterns import STREETS

router = APIRouter()


@router.get("/")
async def root():
    return {
        "message": "Маршрутизатор API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/generate - генерация точек",
            "/route/baseline - расчет базового маршрута",
            "/route/optimize - оптимизированный маршрут",
            "/route/matrix - матрица расстояний",
            "/geocode - получить координаты по адресу",
            "/health - проверка статуса",
            "/address/photon_suggest - автокомплит адресов через Photon (рекомендуется)",
            "/traffic/update - обновить traffic.csv по текущему времени",
            "/traffic/status - текущие скорости на улицах",
        ],
    }


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/address/photon_suggest")
def photon_suggest_address(
    q: str = FastAPIQuery(..., description="Часть адреса для поиска"),
    city: str = FastAPIQuery(None, description="Город для фильтрации результатов"),
    limit: int = FastAPIQuery(5, description="Максимум результатов"),
):
    url = "https://photon.komoot.io/api/"
    params = {"q": q, "limit": limit * 3, "lang": "ru"}
    headers = {"User-Agent": "backend-routemapper/1.0"}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=3)
        resp.raise_for_status()
        data = resp.json()
        suggestions = []
        city_lower = city.strip().lower() if city else None
        for feature in data.get("features", []):
            prop = feature.get("properties", {})
            result_city = (prop.get("city") or prop.get("town") or prop.get("village") or "").lower()
            if city_lower and result_city and city_lower != result_city and city_lower not in result_city:
                continue
            coords = feature.get("geometry", {}).get("coordinates", [None, None])
            suggestions.append({
                "name": prop.get("name"),
                "street": prop.get("street"),
                "city": prop.get("city"),
                "country": prop.get("country"),
                "postcode": prop.get("postcode"),
                "osm_value": prop.get("osm_value"),
                "housenumber": prop.get("housenumber"),
                "lat": coords[1],
                "lon": coords[0],
                "full": prop.get("label"),
            })
            if len(suggestions) >= limit:
                break
        return {"suggestions": suggestions}
    except Exception as e:
        return {"suggestions": [], "error": str(e)}


@router.post("/geocode")
def geocode(request: AddressRequest):
    coords = geocode_address(request.city, request.street, request.house)
    if coords is None:
        raise HTTPException(status_code=404, detail="Не удалось найти координаты по указанному адресу")
    lat, lon = coords
    return {"city": request.city, "street": request.street, "house": request.house, "lat": lat, "lon": lon}


@router.post("/address/validate")
def validate_address(request: AddressRequest):
    coords = geocode_address(request.city, request.street, request.house)
    if coords is None:
        return {"valid": False, "message": "Адрес не найден"}
    lat, lon = coords
    return {"valid": True, "lat": lat, "lon": lon}


@router.post("/generate", response_model=GenerateResponse)
def generate_points(request: GenerateRequest):
    points = []
    center = request.city_center
    radius_deg = request.radius_km / 111.0

    for i in range(request.points_count):
        angle = random.uniform(0, 2 * math.pi)
        r = random.uniform(0, radius_deg) * math.sqrt(random.random())
        lat = center.lat + r * math.cos(angle)
        lon = center.lon + r * math.sin(angle)
        points.append(Point(id=i, lat=lat, lon=lon))

    try:
        resolve_points_with_coordinates(points)
    except HTTPException as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при проверке адресов: {e.detail}")

    return GenerateResponse(
        points=points,
        center=center,
        radius_km=request.radius_km,
        message=f"Сгенерировано {request.points_count} точек в радиусе {request.radius_km} км",
    )


def _build_geojson(route_indices, ordered_points, route_coords, geometry, geometry_source, optimize_by, weight_source, transport_str):
    point_features = []
    visit_order = 0

    for seq_idx, point_idx in enumerate(route_indices):
        pt = ordered_points[point_idx]
        lon, lat = route_coords[seq_idx]
        is_start = (seq_idx == 0)

        props = {
            "order": seq_idx,
            "id": pt.id,
            "priority": pt.priority.value if hasattr(pt.priority, "value") else pt.priority,
            "is_start": is_start,
        }
        if not is_start:
            visit_order += 1
            props["visit_order"] = visit_order

        point_features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": props,
        })

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": geometry},
                "properties": {
                    "name": "route",
                    "optimize_by": optimize_by,
                    "matrix_source": weight_source,
                    "profile": transport_str,
                    "geometry_source": geometry_source,
                },
            },
            *point_features,
        ],
    }


@router.post("/route/geojson")
def route_geojson(
    request: RouteRequest,
    mode: str = Query("optimized", description="Порядок точек: original | nn | optimized"),
    use_advanced: bool = Query(True, description="Использовать продвинутую оптимизацию (Or-opt)"),
    use_annealing: bool = Query(False, description="Имитация отжига для сложных случаев"),
    optimize_by: str = Query("duration", description="Метрика: duration | distance"),
    profile: TransportProfile = Query(TransportProfile.CAR, description="car | walking | transit"),
):
    if len(request.points) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 точки")

    ordered_points, _, start_index, end_index = prepare_route_points(request)
    transport_str = osrm_profile_for_transport(profile)
    weight_matrix, weight_source = calculate_weight_matrix(ordered_points, weight_type=optimize_by, transport=transport_str)

    if mode == "original":
        route_indices = list(range(len(ordered_points)))
    elif mode == "nn":
        route_indices = nearest_neighbor_route(
            ordered_points, weight_matrix,
            start_index=start_index or 0, end_index=end_index,
        )
    else:
        nn_route_indices = nearest_neighbor_route(
            ordered_points, weight_matrix,
            start_index=start_index or 0, end_index=end_index,
        )
        fixed_start = start_index is not None
        fixed_end = end_index is not None
        if use_advanced:
            route_indices = optimize_route_advanced(
                nn_route_indices, weight_matrix,
                use_or_opt=True, use_simulated_annealing=use_annealing,
                fixed_start=fixed_start, fixed_end=fixed_end, points=ordered_points,
            )
        else:
            route_indices = two_opt(
                nn_route_indices, weight_matrix,
                fixed_start=fixed_start, fixed_end=fixed_end, points=ordered_points,
            )

    route_coords = [(ordered_points[i].lon, ordered_points[i].lat) for i in route_indices]
    osrm_coords = ";".join([f"{lon},{lat}" for lon, lat in route_coords])
    geometry = get_osrm_route_geometry(osrm_coords, profile=transport_str)
    geometry_source = "osrm"

    if geometry is None:
        if len(route_coords) >= 2:
            geometry = [[lon, lat] for lon, lat in route_coords]
            geometry_source = "direct_fallback"
        else:
            raise HTTPException(status_code=502, detail="OSRM недоступен")

    geojson = _build_geojson(
        route_indices, ordered_points, route_coords,
        geometry, geometry_source, optimize_by, weight_source, transport_str,
    )
    return Response(content=json.dumps(geojson, ensure_ascii=False), media_type="application/geo+json")


@router.post("/route/baseline", response_model=RouteResponse)
def calculate_baseline_route(
    request: RouteRequest,
    profile: TransportProfile = Query(TransportProfile.CAR, description="car | walking | transit"),
):
    if len(request.points) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 точки для маршрута")

    sorted_points, has_street, _, _ = prepare_route_points(request)
    distance_matrix, source = calculate_distance_matrix(sorted_points, transport=profile)

    base_order = [p.id for p in sorted_points]
    route_indices = list(range(len(sorted_points)))
    total_distance = calculate_route_distance(route_indices, distance_matrix)

    return RouteResponse(
        order=base_order,
        sorted_by_street=has_street,
        total_distance_meters=total_distance,
        total_distance_km=total_distance / 1000,
        point_count=len(sorted_points),
        matrix_source=source,
    )


@router.post("/route/matrix")
def get_distance_matrix(
    request: RouteRequest,
    profile: TransportProfile = Query(TransportProfile.CAR, description="car | walking | transit"),
):
    sorted_points, _, _, _ = prepare_route_points(request)
    distance_matrix, source = calculate_distance_matrix(sorted_points, transport=profile)
    return {"matrix": distance_matrix.tolist(), "source": source, "points_count": len(sorted_points)}


@router.post("/route/optimize", response_model=OptimizedRouteResponse)
def optimize_route(
    request: RouteRequest,
    use_advanced: bool = Query(True, description="Продвинутая оптимизация (Or-opt)"),
    use_annealing: bool = Query(False, description="Имитация отжига"),
    profile: TransportProfile = Query(TransportProfile.CAR, description="car | walking | transit"),
    optimize_by: str = Query("duration", description="duration | distance"),
):
    if len(request.points) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 точки для маршрута")

    ordered_points, has_street, start_index, end_index = prepare_route_points(request)
    transport_str = osrm_profile_for_transport(profile)
    weight_matrix, source = calculate_weight_matrix(ordered_points, weight_type=optimize_by, transport=transport_str)

    original_order_ids = [p.id for p in ordered_points]
    original_route_indices = list(range(len(ordered_points)))
    original_weight = calculate_route_distance(
        original_route_indices, weight_matrix, ordered_points,
        fixed_start=(start_index is not None), fixed_end=(end_index is not None),
    )

    nn_route_indices = nearest_neighbor_route(
        ordered_points, weight_matrix,
        start_index=start_index or 0, end_index=end_index,
    )

    fixed_start = start_index is not None
    fixed_end = end_index is not None

    if use_advanced:
        optimized_route_indices = optimize_route_advanced(
            nn_route_indices, weight_matrix,
            use_or_opt=True, use_simulated_annealing=use_annealing,
            fixed_start=fixed_start, fixed_end=fixed_end, points=ordered_points,
        )
        algorithm = "NN + 2-opt + Or-opt"
        if use_annealing:
            algorithm += " + Simulated Annealing"
    else:
        optimized_route_indices = two_opt(
            nn_route_indices, weight_matrix,
            fixed_start=fixed_start, fixed_end=fixed_end, points=ordered_points,
        )
        algorithm = "Nearest Neighbor + 2-opt"

    optimized_weight = calculate_route_distance(
        optimized_route_indices, weight_matrix, ordered_points,
        fixed_start=fixed_start, fixed_end=fixed_end,
    )
    improvement = ((original_weight - optimized_weight) / original_weight) * 100 if original_weight > 0 else 0.0

    optimized_order_ids = [ordered_points[i].id for i in optimized_route_indices]

    if optimize_by == "duration":
        original_value = round(original_weight / 60, 1)
        optimized_value = round(optimized_weight / 60, 1)
    else:
        original_value = round(original_weight / 1000, 2)
        optimized_value = round(optimized_weight / 1000, 2)

    return OptimizedRouteResponse(
        original_order=original_order_ids,
        sorted_by_street=has_street,
        optimized_order=optimized_order_ids,
        original_distance_km=original_value,
        optimized_distance_km=optimized_value,
        improvement_percent=round(improvement, 2),
        algorithm_used=f"{algorithm} (optimize_by={optimize_by})",
        matrix_source=source,
    )


@router.post("/traffic/update")
def update_traffic():
    try:
        count = generate_traffic_csv()
        return {"status": "ok", "records": count, "message": f"Updated {count} records"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/traffic/status")
async def get_traffic_status():
    status = []
    for road in STREETS:
        status.append({
            "name": road.get("name"),
            "speed": get_current_speed(road),
            "base_speed": road.get("base_speed"),
        })
    return {"streets": status}
