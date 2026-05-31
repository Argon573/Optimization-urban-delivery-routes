export function buildRouteCacheKey(routePoints, transportProfile, startPoint) {
    const pointsKey = (routePoints ?? [])
        .map((p) => `${p.id}:${p.latitude}:${p.longitude}`)
        .join('|');

    const startKey = startPoint
        ? `${startPoint.lat}:${startPoint.lon}`
        : '';

    return `${transportProfile}::${startKey}::${pointsKey}`;
}
