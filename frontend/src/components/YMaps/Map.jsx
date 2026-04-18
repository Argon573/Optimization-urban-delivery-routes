import Ymap from './Ymap';
import { usePoints } from '../RouteScreen/PointsContext';
import styles from './map.module.scss';
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import './map.scss';
const Map = () => {

    const { points, removePoint } = usePoints();


    const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="marker-inner"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    console.log(points);
    return (
        <div className={styles.map}>
            <Ymap Markers={
                points.map((point, index) => (
                    <Marker key={index} position={[point.latitude, point.longitude]} icon={customIcon}>
                        <Popup>Себе по ебучке тыкни, пес</Popup>
                    </Marker>
                ))}
            routePoints={points}
            />
        </div>
    )
}

export default Map;