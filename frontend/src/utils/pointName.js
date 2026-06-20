export const DEFAULT_POINT_NAME = 'Точка маршрута';

export function getPointDisplayName(point) {
    const name = point?.name?.trim();
    if (name) {
        return name;
    }
    return DEFAULT_POINT_NAME;
}
