from typing import List, Optional, Tuple
import numpy as np
import random
import math
from models import Point, DistanceMethod, RouteRequest, TransportProfile
from utils import (
    haversine_distance,
    haversine_distance_vectorized,
    sort_points_by_street_coordinates,
    resolve_points_with_coordinates,
    get_osrm_distance_wrapper,
    get_osrm_route_info,
)


def calculate_distance_matrix(
    points: List[Point],
    method: DistanceMethod = DistanceMethod.OSRM,
    transport: TransportProfile = TransportProfile.CAR,
) -> Tuple[np.ndarray, str]:
    """Расчет матрицы расстояний с поддержкой OSRM и векторизованного Haversine."""
    n = len(points)
    matrix = np.zeros((n, n))
    # Приведение к Enum, если строка
    if isinstance(method, str):
        method_enum = DistanceMethod(method.lower()) if method.lower() in DistanceMethod.__members__.values() or method.lower() in ["osrm", "euclidean"] else DistanceMethod.OSRM
    else:
        method_enum = method
    source_used = method_enum

    if method_enum == DistanceMethod.OSRM:
        # Сначала пробуем OSRM, на ошибку или таймаут переходим на Haversine
        osrm_failed = False
        for i in range(n):
            for j in range(i + 1, n):
                if not osrm_failed:
                    dist = get_osrm_distance_wrapper(points[i], points[j], transport)
                    if dist is not None:
                        matrix[i][j] = matrix[j][i] = dist
                    else:
                        osrm_failed = True
                        source_used = DistanceMethod.EUCLIDEAN

        # Если OSRM не сработал, используем векторизованный Haversine
        if osrm_failed:
            matrix = haversine_distance_vectorized(points)
    else:
        # Векторизованный расчет Haversine для всей матрицы за раз
        matrix = haversine_distance_vectorized(points)

    return matrix, source_used.value

def calculate_weight_matrix(
    points: List[Point], 
    weight_type: str = "duration",
    transport: str = "driving"
) -> Tuple[np.ndarray, str]:
    """
    Расчёт матрицы весов (время или расстояние) с учётом пробок через OSRM.
    weight_type: "duration" (секунды) или "distance" (метры)
    """
    n = len(points)
    matrix = np.zeros((n, n))
    failed_count = 0
    
    for i in range(n):
        for j in range(i + 1, n):
            info = get_osrm_route_info(
                f"{points[i].lon},{points[i].lat}",
                f"{points[j].lon},{points[j].lat}",
                transport=transport
            )
            if info:
                if weight_type == "duration":
                    weight = info["duration"]
                else:
                    weight = info["distance"]
                matrix[i][j] = matrix[j][i] = weight
            else:
                # Fallback на евклидово расстояние (метры)
                weight = haversine_distance(points[i], points[j])
                matrix[i][j] = matrix[j][i] = weight
                failed_count += 1
    
    source = "osrm" if failed_count == 0 else "osrm_partial_fallback"
    return matrix, source

def calculate_route_distance(
    route_order: List[int], 
    distance_matrix: np.ndarray
    ) -> float:
    total = 0.0
    for k in range(len(route_order) - 1):
        total += distance_matrix[route_order[k]][route_order[k + 1]]
    return total


def nearest_neighbor_route(
    points: List[Point],
    distance_matrix: np.ndarray,
    start_index: Optional[int] = 0,
    end_index: Optional[int] = None,
) -> List[int]:
    n = len(points)
    if start_index is None:
        start_index = 0

    visited = [False] * n
    route = [start_index]
    visited[start_index] = True

    if end_index is not None:
        visited[end_index] = True

    remaining = [i for i in range(n) if not visited[i]]

    while remaining:
        current = route[-1]
        next_point = min(remaining, key=lambda i: distance_matrix[current][i])
        route.append(next_point)
        remaining.remove(next_point)

    if end_index is not None:
        route.append(end_index)

    return route


def two_opt(
    route: List[int], 
    distance_matrix: np.ndarray, 
    fixed_start: bool = False, 
    fixed_end: bool = False, 
    max_iterations: int = 100
    ) -> List[int]:
    """Оптимизация маршрута методом 2-opt с расчетом только измененных ребер."""
    best = route.copy()
    best_distance = calculate_route_distance(best, distance_matrix)
    improved = True
    iterations = 0

    while improved and iterations < max_iterations:
        improved = False
        iterations += 1

        for i in range(1 if fixed_start else 0, len(best) - 2):
            for j in range(i + 1, len(best) if not fixed_end else len(best) - 1):
                if j - i == 1:
                    continue

                # Расчет только измененных ребер вместо полного маршрута
                old_cost = distance_matrix[best[i-1]][best[i]] + distance_matrix[best[j]][best[j+1]] if j+1 < len(best) else distance_matrix[best[j]][best[0]]
                new_cost = distance_matrix[best[i-1]][best[j]] + distance_matrix[best[i]][best[j+1]] if j+1 < len(best) else distance_matrix[best[i]][best[0]]
                
                if new_cost < old_cost:
                    best = best[:i] + best[i:j+1][::-1] + best[j+1:]
                    best_distance -= old_cost - new_cost
                    improved = True

    return best


def _match_existing_point(
    points: List[Point], 
    candidate: Point
    ) -> Optional[Point]:
    if candidate.id is not None:
        for p in points:
            if p.id == candidate.id:
                return p

    for p in points:
        if (
            p.lat is not None
            and p.lon is not None
            and candidate.lat is not None
            and candidate.lon is not None
            and abs(p.lat - candidate.lat) < 1e-8
            and abs(p.lon - candidate.lon) < 1e-8
        ):
            return p

    return None


def prepare_route_points(
    request: RouteRequest
    ) -> Tuple[List[Point], bool, Optional[int], Optional[int]]:
    points = resolve_points_with_coordinates(request.points)
    has_street = any(p.street for p in points)

    if has_street:
        middle_points = sort_points_by_street_coordinates(points)
    else:
        middle_points = sorted(points, key=lambda p: p.id if p.id is not None else 0)

    start_index = None
    end_index = None
    ordered = []

    if request.start_point is not None:
        sp_resolved = resolve_points_with_coordinates([request.start_point])[0]
        matched = _match_existing_point(middle_points, sp_resolved)
        if matched:
            middle_points = [p for p in middle_points if p is not matched]
            ordered.append(matched)
        else:
            ordered.append(sp_resolved)
        start_index = 0

    ordered.extend(middle_points)

    if request.end_point is not None:
        ep_resolved = resolve_points_with_coordinates([request.end_point])[0]
        matched_end = _match_existing_point(ordered, ep_resolved)

        if matched_end is not None:
            # уже есть в списке
            pass
        else:
            ordered.append(ep_resolved)

        end_index = len(ordered) - 1

    return ordered, has_street, start_index, end_index


def or_opt(
    route: List[int], 
    distance_matrix: np.ndarray, 
    segment_size: int = 3, 
    fixed_start: bool = False, 
    fixed_end: bool = False
    ) -> List[int]:
    """Or-opt: перемещение сегмента из 1-3 точек в другую позицию маршрута.
    Дает более качественные маршруты чем 2-opt."""
    best = route.copy()
    improved = True
    
    while improved:
        improved = False
        n = len(best)
        
        for seg_len in range(1, min(segment_size + 1, n // 2)):
            for i in range(1 if fixed_start else 0, n - seg_len):
                segment = best[i:i + seg_len]
                remaining = best[:i] + best[i + seg_len:]
                
                # Пробуем вставить сегмент в каждую позицию
                for j in range(1 if fixed_start else 0, len(remaining) - (1 if fixed_end else 0) + 1):
                    new_route = remaining[:j] + segment + remaining[j:]
                    
                    if calculate_route_distance(new_route, distance_matrix) < calculate_route_distance(best, distance_matrix):
                        best = new_route
                        improved = True
                        break
                
                if improved:
                    break
            
            if improved:
                break
    
    return best


def simulated_annealing(
    route: List[int],
    distance_matrix: np.ndarray,
    initial_temp: float = 1000.0,
    cooling_rate: float = 0.95,
    max_iterations: int = 5000,
    fixed_start: bool = False,
    fixed_end: bool = False,
) -> List[int]:
    """Имитация отжига для выхода из локальных оптимумов.
    Может находить лучшие решения чем 2-opt в сложных случаях."""
    current = route.copy()
    current_distance = calculate_route_distance(current, distance_matrix)
    best = current.copy()
    best_distance = current_distance
    
    temp = initial_temp
    n = len(route)
    
    for iteration in range(max_iterations):
        # Генерируем соседнее решение (2-opt ход)
        new_route = current.copy()
        
        # Выбираем две случайные позиции
        while True:
            i = random.randint(1 if fixed_start else 0, n - 2)
            j = random.randint(i + 1, n - 1 if not fixed_end else n - 2)
            if j - i > 1:
                break
        
        # Разворачиваем сегмент
        new_route[i:j+1] = new_route[i:j+1][::-1]
        new_distance = calculate_route_distance(new_route, distance_matrix)
        
        # Вероятность принятия хорошего или среднего решения
        delta = new_distance - current_distance
        if delta < 0 or random.random() < math.exp(-delta / temp):
            current = new_route
            current_distance = new_distance
            
            # Обновляем лучшее найденное решение
            if current_distance < best_distance:
                best = current.copy()
                best_distance = current_distance
        
        # Охлаждаем
        temp *= cooling_rate
        
        # Рано выходим если температура очень низкая
        if temp < 1e-4:
            break
    
    return best


def optimize_route_advanced(
    route: List[int],
    distance_matrix: np.ndarray,
    use_or_opt: bool = True,
    use_simulated_annealing: bool = False,
    fixed_start: bool = False,
    fixed_end: bool = False,
) -> List[int]:
    """Комбинированная оптимизация: 2-opt + Or-opt + опционально имитация отжига."""
    # Начинаем с 2-opt
    route = two_opt(route, distance_matrix, fixed_start, fixed_end)
    
    # Затем Or-opt для улучшения качества
    if use_or_opt:
        route = or_opt(route, distance_matrix, segment_size=3, fixed_start=fixed_start, fixed_end=fixed_end)
    
    # И наконец имитация отжига если нужна (для сложных случаев)
    if use_simulated_annealing:
        route = simulated_annealing(
            route,
            distance_matrix,
            initial_temp=100.0,
            cooling_rate=0.98,
            max_iterations=2000,
            fixed_start=fixed_start,
            fixed_end=fixed_end,
        )
    
    return route
