import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import LeafletMap from './LeafletMap';
import MapFocusController from './MapFocusController';
import MapClickAddPoint from './MapClickAddPoint';
import WaypointMarker from './WaypointMarker';
import { useRoute } from '../../context/RouteContext';
import { getPriorityColor } from '../../constants/pointPriority';
import { POINT_PRIORITIES } from '../../constants/pointPriority';
import { createWaypointMarkerIcon, userLocationIcon } from '../../utils/mapIcons';
import { parseRouteVisitOrders } from '../../utils/parseRouteVisitOrders';
import styles from './map.module.scss';
import './map.scss';

const DEFAULT_CENTER = [56.840508, 60.650206];

const RouteMapView = () => {
    const { points, startPoint, routeGeoJson } = useRoute();

    const visitOrders = useMemo(
        () => parseRouteVisitOrders(routeGeoJson),
        [routeGeoJson],
    );

    const hasBuiltRoute = Boolean(routeGeoJson);

    const mapCenter = useMemo(() => {
        if (startPoint) {
            return [startPoint.latitude, startPoint.longitude];
        }
        if (points.length > 0) {
            return [points[0].latitude, points[0].longitude];
        }
        return DEFAULT_CENTER;
    }, [startPoint, points]);

    return (
        <div className={styles.map}>
            <LeafletMap initialCenter={mapCenter}>
                <MapFocusController />
                <MapClickAddPoint />

                {startPoint?.isUserLocation && (
                    <Marker
                        position={[startPoint.latitude, startPoint.longitude]}
                        icon={userLocationIcon}
                    >
                        <Popup>Моё местоположение</Popup>
                    </Marker>
                )}

                {startPoint && !startPoint.isUserLocation && (
                    <Marker
                        position={[startPoint.latitude, startPoint.longitude]}
                        icon={createWaypointMarkerIcon('#6C63FF')}
                    >
                        <Popup>{startPoint.address}</Popup>
                    </Marker>
                )}

                {points.map((point) => {
                    const priority = point.priority ?? POINT_PRIORITIES.NORMAL;
                    const color = getPriorityColor(priority);
                    const visitOrder = hasBuiltRoute ? visitOrders[point.id] : null;

                    return (
                        <WaypointMarker
                            key={point.id}
                            point={point}
                            color={color}
                            visitOrder={visitOrder}
                        />
                    );
                })}
            </LeafletMap>
        </div>
    );
};

export default RouteMapView;
