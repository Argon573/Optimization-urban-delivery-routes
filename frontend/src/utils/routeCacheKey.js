export function buildRouteCacheKey(routePoints, transportProfile, startPoint) {
    const pointsKey = (routePoints ?? [])
        .map((p) => `${p.id}:${p.latitude}:${p.longitude}:${p.priority ?? 'normal'}`)
        .join('|');

    const startKey = startPoint
        ? `${startPoint.lat ?? startPoint.latitude}:${startPoint.lon ?? startPoint.longitude}`
        : '';

    return `${transportProfile}::${startKey}::${pointsKey}`;
}
