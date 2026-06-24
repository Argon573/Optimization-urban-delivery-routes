import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useRoute } from '../../context/RouteContext';

const MapFocusController = () => {
    const { mapFocus } = useRoute();
    const map = useMap();

    useEffect(() => {
        if (!mapFocus) {
            return;
        }

        const { latitude, longitude } = mapFocus;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        try {
            map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), {
                duration: 0.8,
            });
        } catch {
            // ignore invalid map coordinates
        }
    }, [map, mapFocus]);

    return null;
};

export default MapFocusController;
