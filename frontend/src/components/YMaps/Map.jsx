import React, { useMemo } from 'react';
import Ymap from './Ymap';
import { usePoints } from '../RouteScreen/PointsContext';
import styles from './map.module.scss';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './map.scss';

const DEFAULT_CENTER = [56.840508, 60.650206];

const Map = () => {
    const { points, transportProfile, startPoint, apiStartPoint } = usePoints();

    const mapCenter = useMemo(() => {
        if (startPoint) {
            return [startPoint.latitude, startPoint.longitude];
        }
        if (points.length > 0) {
            return [points[0].latitude, points[0].longitude];
        }
        return DEFAULT_CENTER;
    }, [startPoint, points]);

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 0C17.8513 0 23 5.12837 23 11.4545C23 12.2267 22.9233 12.9811 22.7771 13.7104C21.7621 21.329 11.5605 30 11.5605 30C11.5605 30 2.87877 22.6209 0.736307 15.4961C0.260397 14.2393 0 12.8773 0 11.4545C0 5.12837 5.14873 0 11.5 0Z" fill="#6C63FF"/>
</svg>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 25C19.4035 25 25 19.4035 25 12.5C25 5.59645 19.4035 0 12.5 0C5.59645 0 0 5.59645 0 12.5C0 19.4035 5.59645 25 12.5 25Z" fill="#3478F5" fill-opacity="0.2"/>
  <path d="M12.5 18.5C15.8137 18.5 18.5 15.8137 18.5 12.5C18.5 9.18629 15.8137 6.49999 12.5 6.49999C9.18629 6.49999 6.49999 9.18629 6.49999 12.5C6.49999 15.8137 9.18629 18.5 12.5 18.5Z" fill="white"/>
  <path d="M12.5 17.5C15.2614 17.5 17.5 15.2614 17.5 12.5C17.5 9.7386 15.2614 7.5 12.5 7.5C9.7386 7.5 7.5 9.7386 7.5 12.5C7.5 15.2614 9.7386 17.5 12.5 17.5Z" fill="#3478F5"/>
</svg>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    return (
        <div className={styles.map}>
            <Ymap
                initialCenter={mapCenter}
                Markers={
                    <>
                        {startPoint?.isUserLocation && (
                            <Marker
                                position={[startPoint.latitude, startPoint.longitude]}
                                icon={userIcon}
                            >
                                <Popup>Моё местоположение</Popup>
                            </Marker>
                        )}

                        {startPoint && !startPoint.isUserLocation && (
                            <Marker
                                position={[startPoint.latitude, startPoint.longitude]}
                                icon={customIcon}
                            >
                                <Popup>{startPoint.address}</Popup>
                            </Marker>
                        )}

                        {points.map((point) => (
                            <Marker
                                key={point.id}
                                position={[point.latitude, point.longitude]}
                                icon={customIcon}
                            >
                                <Popup>{point.address}</Popup>
                            </Marker>
                        ))}
                    </>
                }
                routePoints={points}
                startPoint={apiStartPoint}
                transportProfile={transportProfile}
            />
        </div>
    );
};

export default Map;
