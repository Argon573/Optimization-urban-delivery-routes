import { API_BASE } from './config';

export const DEFAULT_CITY_CENTER = {
    lat: 56.840508,
    lon: 60.650206,
};

export async function generateRoutePoints({ radiusKm, pointsCount, cityCenter = DEFAULT_CITY_CENTER }) {
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            city_center: cityCenter,
            radius_km: radiusKm,
            points_count: pointsCount,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const detail = errorBody.detail;
        const message = typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
                ? detail.map((e) => e.msg).join(', ')
                : 'Не удалось сгенерировать точки';
        throw new Error(message);
    }

    return response.json();
}
