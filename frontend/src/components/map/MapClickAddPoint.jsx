import { useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useRoute } from '../../context/RouteContext';
import { reverseGeocode } from '../../api/reverseGeocode';
import { ROUTE_POINTS_MAX } from '../../constants/routeLimits';

const CLICK_DELAY_MS = 280;

const MapClickAddPoint = () => {
    const { addPoint, points } = useRoute();
    const map = useMap();
    const clickTimerRef = useRef(null);

    useMapEvents({
        click: (event) => {
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }

            const { lat, lng } = event.latlng;

            if (points.length >= ROUTE_POINTS_MAX) {
                return;
            }

            clickTimerRef.current = setTimeout(async () => {
                clickTimerRef.current = null;

                let address;
                try {
                    address = await reverseGeocode(lat, lng);
                } catch {
                    address = `Точка на карте (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
                }

                addPoint({
                    address,
                    latitude: lat,
                    longitude: lng,
                });
            }, CLICK_DELAY_MS);
        },
        dblclick: (event) => {
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            map.setView(event.latlng, map.getZoom() + 1);
        },
    });

    return null;
};

export default MapClickAddPoint;
