import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ymap.css';
import { usePoints } from '../RouteScreen/PointsContext';
import CustomZoomControl from './custom control/CustomZoomControl';
import styles from './custom control/customZoomControl.module.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RouteGeoJsonLayer = () => {
    const { routeGeoJson } = usePoints();

    if (!routeGeoJson) {
        return null;
    }

    return (
        <GeoJSON
            data={routeGeoJson}
            filter={(f) => {
                const type = f?.geometry?.type;
                return type && type !== 'Polygon' && type !== 'Point';
            }}
            style={{ color: '#3388ff', weight: 2 }}
            onEachFeature={(feature, layer) => {
                if (feature.properties?.name) {
                    layer.bindPopup(`
            <strong>${feature.properties.name}</strong><br/>
            Тип: ${feature.properties.type || 'не указан'}
          `);
                }
            }}
        />
    );
};

const Ymap = ({
    initialCenter,
    initialZoom = 13,
    Markers,
}) => (
    <div className="leaflet" style={{ position: 'absolute', inset: 0 }}>
        <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            className="leaflet-container"
            style={{ width: '100%', height: '100%' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            <CustomZoomControl className={styles.customZoomControl} />

            {Markers}
            <RouteGeoJsonLayer />
        </MapContainer>
    </div>
);

export default Ymap;
