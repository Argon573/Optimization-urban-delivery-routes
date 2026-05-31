const API_BASE = 'http://194.124.211.6:8000';

export async function getMap(startPoint, endPoint, points, transportProfile = 'car') {
    const params = new URLSearchParams({ profile: transportProfile });
    const response = await fetch(`${API_BASE}/route/geojson?${params}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            start_point: startPoint ?? null,
            ...(endPoint && { end_point: endPoint }),
            points,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const detail = errorBody.detail;
        const message = typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
                ? detail.map((e) => e.msg ?? String(e)).join(', ')
                : 'Не удалось построить маршрут';
        throw new Error(message);
    }

    return response.json();
}
