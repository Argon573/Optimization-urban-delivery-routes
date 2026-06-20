export function parseRouteVisitOrders(routeGeoJson) {
    if (!routeGeoJson?.features) {
        return {};
    }

    const orders = {};

    for (const feature of routeGeoJson.features) {
        if (feature.geometry?.type !== 'Point') {
            continue;
        }

        const { id, visit_order: visitOrder, is_start: isStart } = feature.properties ?? {};

        if (isStart || id == null || visitOrder == null) {
            continue;
        }

        orders[id] = visitOrder;
    }

    return orders;
}
