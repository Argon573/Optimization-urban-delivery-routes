from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PointPriority(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Point(BaseModel):
    """Модель точки на карте"""
    id: Optional[int] = None
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Широта от -90 до 90")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Долгота от -180 до 180")
    city: Optional[str] = Field(None, description="Город, если известно")
    street: Optional[str] = Field(None, description="Название улицы (опционально)")
    house: Optional[str] = Field(None, description="Дом (опционально)")
    priority: PointPriority = Field(
        PointPriority.NORMAL,
        description="Приоритет посещения: normal | high | urgent",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 0,
                "city": "Москва",
                "street": "Тверская ул.",
                "house": "1",
                "lat": 55.7558,
                "lon": 37.6176
            }
        }
    }

    def full_address(self) -> Optional[str]:
        if self.street and self.city:
            if self.house:
                return f"{self.city}, {self.street} {self.house}"
            return f"{self.city}, {self.street}"
        return None


class GenerateRequest(BaseModel):
    """Запрос на генерацию точек"""
    city_center: Point = Field(..., description="Центр города")
    radius_km: float = Field(5.0, ge=1, le=25, description="Радиус в км (1-25)")
    points_count: int = Field(10, ge=2, le=25, description="Количество точек (2-25)")


class GenerateResponse(BaseModel):
    """Ответ с сгенерированными точками"""
    points: List[Point]
    center: Point
    radius_km: float
    message: str


class RouteRequest(BaseModel):
    """Запрос на расчет маршрута"""
    points: List[Point] = Field(..., min_length=2, max_length=25, description="Список точек для маршрута")
    start_point: Optional[Point] = Field(None, description="Начальная точка (опционально)")
    end_point: Optional[Point] = Field(None, description="Конечная точка (опционально)")


class RouteResponse(BaseModel):
    """Ответ с информацией о маршруте"""
    order: List[int] = Field(..., description="Порядок обхода точек (ids)")
    sorted_by_street: bool = Field(False, description="Порядок отсортирован по улице и координатам")
    total_distance_meters: float = Field(..., description="Общая дистанция в метрах")
    total_distance_km: float = Field(..., description="Общая дистанция в километрах")
    point_count: int = Field(..., description="Количество точек")
    matrix_source: str = Field(..., description="Источник матрицы расстояний")


class OptimizedRouteResponse(BaseModel):
    """Ответ с оптимизированным маршрутом"""
    original_order: List[int] = Field(..., description="Исходный порядок точек (ids)")
    sorted_by_street: bool = Field(False, description="Исходный порядок отсортирован по улице и координатам")
    optimized_order: List[int] = Field(..., description="Оптимизированный порядок точек (ids)")
    original_distance_km: float = Field(..., description="Исходная дистанция в км")
    optimized_distance_km: float = Field(..., description="Оптимизированная дистанция в км")
    improvement_percent: float = Field(..., description="Процент улучшения")
    algorithm_used: str = Field(..., description="Использованный алгоритм")
    matrix_source: str = Field(..., description="Источник расстояний")


class AddressRequest(BaseModel):
    city: str = Field(..., description="Город")
    street: str = Field(..., description="Улица")
    house: Optional[str] = Field(None, description="Дом")


class DistanceMethod(str, Enum):
    OSRM = "osrm"
    EUCLIDEAN = "euclidean"


class TransportProfile(str, Enum):
    """Вид транспорта для построения маршрута (маппится на профиль OSRM)."""
    CAR = "car"
    WALKING = "walking"
    TRANSIT = "transit"
