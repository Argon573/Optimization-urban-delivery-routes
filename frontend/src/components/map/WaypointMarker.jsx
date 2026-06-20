import { Marker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useRoute } from '../../context/RouteContext';
import { createWaypointMarkerIcon } from '../../utils/mapIcons';

const WaypointMarker = ({ point, color, visitOrder }) => {
    const navigate = useNavigate();
    const { openPointSettings } = useRoute();

    return (
        <Marker
            position={[point.latitude, point.longitude]}
            icon={createWaypointMarkerIcon(color, visitOrder)}
            bubblingMouseEvents={false}
            eventHandlers={{
                click: (event) => {
                    L.DomEvent.stopPropagation(event.originalEvent);
                    openPointSettings(point.id);
                    navigate('/route');
                },
            }}
        />
    );
};

export default WaypointMarker;
