from fastapi import Query as FastAPIQuery
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from models import (
    GenerateRequest,
    GenerateResponse,
    RouteRequest,
    RouteResponse,
    OptimizedRouteResponse,
    AddressRequest,
    TransportProfile,
)
from services import (
    calculate_distance_matrix,
    calculate_weight_matrix,
    calculate_route_distance,
    nearest_neighbor_route,
    two_opt,
    or_opt,
    simulated_annealing,
    optimize_route_advanced,
    apply_point_priorities,
    prepare_route_points,
)
from utils import get_osrm_distance_wrapper, resolve_points_with_coordinates, osrm_profile_for_transport, get_osrm_route_geometry
from models import Point
import requests
import math
import random
from functools import lru_cache
from fastapi.concurrency import run_in_threadpool
# from map_render import render_route_map  # временно отключено

router = APIRouter()

# Кэширующая функция (синхронная) для Photon (LRU cache)
@lru_cache(maxsize=256)
def _fetch_photon_suggestions(q: str, limit: int) -> dict:
    """Реальный запрос к Photon API с кэшированием."""
    url = "https://photon.komoot.io/api/"
    params = {"q": q, "limit": limit}
    headers = {"User-Agent": "backend-routemapper/1.0"}
    resp = requests.get(url, params=params, headers=headers, timeout=3)
    resp.raise_for_status()
    return resp.json()

@router.get("/address/photon_suggest")
async def photon_suggest_address(
    q: str = FastAPIQuery(..., description="Часть адреса для поиска"),
    limit: int = FastAPIQuery(5, description="Максимум результатов")
):
    """
    Возвращает список подходящих адресов по подстроке через Photon (OSM).
    """
    try:
        data = await run_in_threadpool(_fetch_photon_suggestions, q, limit)
        suggestions = []
        for feature in data.get("features", []):
            prop = feature.get("properties", {})
            suggestions.append({
                "name": prop.get("name"),
                "street": prop.get("street"),
                "city": prop.get("city"),
                "country": prop.get("country"),
                "postcode": prop.get("postcode"),
                "osm_value": prop.get("osm_value"),
                "lat": feature.get("geometry", {}).get("coordinates", [None, None])[1],
                "lon": feature.get("geometry", {}).get("coordinates", [None, None])[0],
                "full": prop.get("label")
            })
        return {"suggestions": suggestions}
    except Exception as e:
        return {"suggestions": [], "error": str(e)}

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
        ],
    }


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "osrm_available": get_osrm_distance_wrapper(
            Point(lat=55.7558, lon=37.6176),
            Point(lat=55.7658, lon=37.6276),
        )
        is not None,
    }


@router.post("/geocode")
async def geocode(request: AddressRequest):
    from utils import geocode_address

    coords = geocode_address(request.city, request.street, request.house)
    if coords is None:
        raise HTTPException(status_code=404, detail="Не удалось найти координаты по указанному адресу")

    lat, lon = coords
    return {"city": request.city, "street": request.street, "house": request.house, "lat": lat, "lon": lon}



# Проверка существования адреса (отдельный эндпоинт)
@router.post("/address/validate")
async def validate_address(request: AddressRequest):
    from utils import geocode_address
    coords = geocode_address(request.city, request.street, request.house)
    if coords is None:
        return {"valid": False, "message": "Адрес не найден"}
    lat, lon = coords
    return {"valid": True, "lat": lat, "lon": lon}


# Генерация точек с проверкой существования адреса (если заданы city/street)
@router.post("/generate", response_model=GenerateResponse)
async def generate_points(request: GenerateRequest):
    points = []
    center = request.city_center
    radius_deg = request.radius_km / 111.0

    for i in range(request.points_count):
        angle = random.uniform(0, 2 * math.pi)
        r = random.uniform(0, radius_deg) * math.sqrt(random.random())
        lat = center.lat + r * math.cos(angle)
        lon = center.lon + r * math.sin(angle)
        points.append(Point(id=i, lat=lat, lon=lon))

    # Проверка существования адресов для точек, если заданы city/street
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


# Эндпоинт: geojson маршрут с поддержкой оптимизации и различного транспорта

@router.post("/route/geojson")
async def route_geojson(
    request: RouteRequest,
    mode: str = Query("optimized", description="Порядок точек: original | nn | optimized"),
    use_advanced: bool = Query(True, description="Использовать продвинутую оптимизацию (Or-opt)"),
    use_annealing: bool = Query(False, description="Использовать имитацию отжига для сложных случаев"),
    optimize_by: str = Query("duration", description="Метрика оптимизации: duration | distance"),
    profile: TransportProfile = Query(
        TransportProfile.CAR,
        description="Вид транспорта: car | walking | transit",
    ),
    use_priorities: bool = Query(False, description="Учитывать приоритеты точек"),
    priority_strength: float = Query(0.5, ge=0, le=1, description="Сила влияния приоритетов (0-1)"),
):
    """Возвращает GeoJSON маршрута, построенного с учётом весов (время или расстояние)."""
    if len(request.points) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 точки")

    ordered_points, _, start_index, end_index = prepare_route_points(request)
    distance_matrix, _ = calculate_distance_matrix(ordered_points, transport=profile)

    # Матрица весов (duration или distance) для оптимизации
    transport_str = osrm_profile_for_transport(profile)
    weight_matrix, weight_source = calculate_weight_matrix(ordered_points, weight_type=optimize_by, transport=transport_str)

    # Применяем приоритеты точек к матрице весов при необходимости
    if use_priorities:
        weight_matrix = apply_point_priorities(
            weight_matrix,
            ordered_points,
            priority_strength=priority_strength,
        )

    # Определяем порядок точек
    if mode == "original":
        route_indices = list(range(len(ordered_points)))
    elif mode == "nn":
        route_indices = nearest_neighbor_route(
            ordered_points, weight_matrix,
            start_index=start_index or 0, 
            end_index=end_index
        )
    else:  # optimized
        nn_route_indices = nearest_neighbor_route(
            ordered_points, weight_matrix,
            start_index=start_index or 0, 
            end_index=end_index
        )
        if use_advanced:
            route_indices = optimize_route_advanced(
                nn_route_indices, weight_matrix,
                use_or_opt=True,
                use_simulated_annealing=use_annealing,
                fixed_start=(start_index is not None),
                fixed_end=(end_index is not None),
            )
        else:
            route_indices = two_opt(
                nn_route_indices, weight_matrix,
                fixed_start=(start_index is not None),
                fixed_end=(end_index is not None)
            )

    # Координаты точек в нужном порядке
    route_coords = [(ordered_points[i].lon, ordered_points[i].lat) for i in route_indices]
    osrm_coords = ";".join([f"{lon},{lat}" for lon, lat in route_coords])
    osrm_profile = osrm_profile_for_transport(profile)
    geometry = get_osrm_route_geometry(osrm_coords, profile=osrm_profile)
    geometry_source = "osrm"
    # Если OSRM недоступен, но есть хотя бы 2 точки — вернём LineString напрямую из поданных координат
    if geometry is None:
        if len(route_coords) >= 2:
            geometry = [[lon, lat] for lon, lat in route_coords]
            geometry_source = "direct_fallback"
        else:
            raise HTTPException(status_code=502, detail="Ошибка запроса к локальному OSRM (проверьте переменные OSRM_*_URL и доступность сервисов)")

    # Формируем GeoJSON
    def route_to_geojson(route_coords, geometry, geometry_source):
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
                    }
                },
                *[
                    {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [lon, lat]},
                        "properties": {"order": idx}
                    } for idx, (lon, lat) in enumerate(route_coords)
                ]
            ]
        }
    import json
    geojson = route_to_geojson(route_coords, geometry, geometry_source)
    return Response(content=json.dumps(geojson, ensure_ascii=False), media_type="application/geo+json")

@router.post("/route/baseline", response_model=RouteResponse)
async def calculate_baseline_route(
    request: RouteRequest,
    profile: TransportProfile = Query(TransportProfile.CAR, description="Вид транспорта: car | walking | transit"),
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
async def get_distance_matrix(
    request: RouteRequest,
    profile: TransportProfile = Query(TransportProfile.CAR, description="Вид транспорта: car | walking | transit"),
):
    sorted_points, _, _, _ = prepare_route_points(request)
    distance_matrix, source = calculate_distance_matrix(sorted_points, transport=profile)
    return {"matrix": distance_matrix.tolist(), "source": source, "points_count": len(sorted_points)}


@router.post("/route/optimize", response_model=OptimizedRouteResponse)
async def optimize_route(
    request: RouteRequest,
    use_advanced: bool = Query(True, description="Использовать продвинутую оптимизацию (Or-opt)"),
    use_annealing: bool = Query(False, description="Использовать имитацию отжига для сложных случаев"),
    profile: TransportProfile = Query(TransportProfile.CAR, description="Вид транспорта: car | walking | transit"),
    optimize_by: str = Query("duration", description="Метрика оптимизации: duration | distance"),
):
    """Оптимизация маршрута с учётом весов (расстояние или время с пробками)."""
    if len(request.points) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 точки для маршрута")

    # Подготовка точек
    ordered_points, has_street, start_index, end_index = prepare_route_points(request)
    distance_matrix, _ = calculate_distance_matrix(ordered_points, transport=profile)

    # Рассчитываем матрицу весов по выбранной метрике (duration/distance)
    transport_str = osrm_profile_for_transport(profile)
    weight_matrix, source = calculate_weight_matrix(ordered_points, weight_type=optimize_by, transport=transport_str)

    # Исходный порядок (для сравнения)
    original_order_ids = [p.id for p in ordered_points]
    original_route_indices = list(range(len(ordered_points)))
    original_weight = calculate_route_distance(original_route_indices, weight_matrix)

    # Nearest Neighbor
    nn_route_indices = nearest_neighbor_route(
        ordered_points, weight_matrix, 
        start_index=start_index or 0, 
        end_index=end_index
    )
    
    # Продвинутая оптимизация
    if use_advanced:
        optimized_route_indices = optimize_route_advanced(
            nn_route_indices,
            weight_matrix,
            use_or_opt=True,
            use_simulated_annealing=use_annealing,
            fixed_start=(start_index is not None),
            fixed_end=(end_index is not None),
        )
        algorithm = "NN + 2-opt + Or-opt"
        if use_annealing:
            algorithm += " + Simulated Annealing"
    else:
        optimized_route_indices = two_opt(
            nn_route_indices, weight_matrix, 
            fixed_start=(start_index is not None), 
            fixed_end=(end_index is not None)
        )
        algorithm = "Nearest Neighbor + 2-opt"

    optimized_weight = calculate_route_distance(optimized_route_indices, weight_matrix)
    improvement = ((original_weight - optimized_weight) / original_weight) * 100 if original_weight > 0 else 0.0

    optimized_order_ids = [ordered_points[i].id for i in optimized_route_indices]

    # Преобразуем вес в читаемый формат
    if optimize_by == "duration":
        original_value = round(original_weight / 60, 1)  # минуты
        optimized_value = round(optimized_weight / 60, 1)
        unit = "min"
    else:
        original_value = round(original_weight / 1000, 2)  # километры
        optimized_value = round(optimized_weight / 1000, 2)
        unit = "km"

    return OptimizedRouteResponse(
        original_order=original_order_ids,
        sorted_by_street=has_street,
        optimized_order=optimized_order_ids,
        original_distance_km=original_value,  # переиспользуем поле для совместимости
        optimized_distance_km=optimized_value,
        improvement_percent=round(improvement, 2),
        algorithm_used=f"{algorithm} (optimize_by={optimize_by})",
        matrix_source=source,
    )


# Тестовый эндпоинт для проверки работы Яндекс API с вашим ключом
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import Query as FastAPIQuery

@router.get("/road-events")
async def get_road_events(
    lat: float = FastAPIQuery(56.8380, description="Широта центра (Екатеринбург)"),
    lon: float = FastAPIQuery(60.5975, description="Долгота центра"),
    radius_m: int = FastAPIQuery(15000, description="Радиус в метрах")
):
    conn = psycopg2.connect(
        host="db",
        database="traffic_db",
        user="admin",
        password="mysecret",
        cursor_factory=RealDictCursor
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT id, event_type, title, latitude, longitude, severity, detected_at
        FROM road_events
        WHERE expires_at > NOW()
          AND (6371000 * acos(cos(radians(%s)) * cos(radians(latitude)) * cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * sin(radians(latitude)))) <= %s
        ORDER BY detected_at DESC
    """, (lat, lon, lat, radius_m))
    events = cur.fetchall()
    cur.close()
    conn.close()
    return {"events": events, "count": len(events)}