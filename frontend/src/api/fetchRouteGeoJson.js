import { API_BASE } from './config';

export async function fetchRouteGeoJson(
    startPoint,
    endPoint,
    points,
    transportProfile = 'car',
    { lite = false, signal } = {},
) {
    const params = new URLSearchParams({ profile: transportProfile });

    if (lite) {
        params.set('use_advanced', 'false');
        params.set('use_annealing', 'false');
    }

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
        signal,
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        let message = `Ошибка сервера (${response.status})`;

        if (contentType.includes('application/json')) {
            const errorBody = await response.json().catch(() => ({}));
            const detail = errorBody.detail;
            message = typeof detail === 'string'
                ? detail
                : Array.isArray(detail)
                    ? detail.map((e) => e.msg ?? String(e)).join(', ')
                    : message;
        }

        throw new Error(message);
    }

    return response.json();
}
