export const DEFAULT_POINT_NAME = 'Точка маршрута';

export function resolvePointName(point, addressFallback = point?.address) {
    const name = point?.name?.trim();
    if (name) {
        return name;
    }
    const address = addressFallback?.trim();
    if (address) {
        return address;
    }
    return DEFAULT_POINT_NAME;
}

export function getPointDisplayName(point) {
    return resolvePointName(point);
}
