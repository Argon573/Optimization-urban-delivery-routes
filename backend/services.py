from typing import List, Optional, Tuple
import numpy as np
from models import Point, DistanceMethod, RouteRequest
from utils import haversine_distance, sort_points_by_street_coordinates, resolve_points_with_coordinates


def calculate_distance_matrix(points: List[Point], method: DistanceMethod = DistanceMethod.OSRM) -> Tuple[np.ndarray, str]:
    n = len(points)
    matrix = np.zeros((n, n))
    source_used = method

    for i in range(n):
        for j in range(i + 1, n):
            if method == DistanceMethod.OSRM:
                try:
                    from utils import get_osrm_distance
                except ImportError:
                    get_osrm_distance = lambda p1, p2: None

                dist = get_osrm_distance(points[i], points[j])
                if dist is not None:
                    matrix[i][j] = matrix[j][i] = dist
                else:
                    source_used = DistanceMethod.EUCLIDEAN
                    dist = haversine_distance(points[i], points[j])
                    matrix[i][j] = matrix[j][i] = dist
            else:
                dist = haversine_distance(points[i], points[j])
                matrix[i][j] = matrix[j][i] = dist

    return matrix, source_used.value


def calculate_route_distance(route_order: List[int], distance_matrix: np.ndarray) -> float:
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


def two_opt(route: List[int], distance_matrix: np.ndarray, fixed_start: bool = False, fixed_end: bool = False) -> List[int]:
    best = route.copy()
    improved = True

    while improved:
        improved = False

        for i in range(1 if fixed_start else 0, len(best) - 2):
            for j in range(i + 1, len(best) if not fixed_end else len(best) - 1):
                if j - i == 1:
                    continue

                new_route = best[:i] + best[i:j][::-1] + best[j:]
                if calculate_route_distance(new_route, distance_matrix) < calculate_route_distance(best, distance_matrix):
                    best = new_route
                    improved = True

        break

    return best


def _match_existing_point(points: List[Point], candidate: Point) -> Optional[Point]:
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


def prepare_route_points(request: RouteRequest) -> Tuple[List[Point], bool, Optional[int], Optional[int]]:
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
