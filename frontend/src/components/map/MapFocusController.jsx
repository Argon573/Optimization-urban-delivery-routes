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

        map.flyTo([mapFocus.latitude, mapFocus.longitude], Math.max(map.getZoom(), 15), {
            duration: 0.8,
        });
    }, [map, mapFocus]);

    return null;
};

export default MapFocusController;
