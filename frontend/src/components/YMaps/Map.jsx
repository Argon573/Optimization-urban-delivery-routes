import React from "react";
import Ymap from './Ymap';
import { useState, useEffect } from "react";
import { usePoints } from '../RouteScreen/PointsContext';
import styles from './map.module.scss';
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import './map.scss';
import { getUserPosition } from "../../hooks/getUserPosition"

const Map = () => {

    const { points, removePoint } = usePoints();
    const [userPosition, setUserPosition] = useState(null);
    /*
    useEffect(() => {
        getUserPosition().then(pos => {
            setUserPosition(pos);
        });
    }, []);

    console.log(userPosition);

    const userPoint = userPosition
        ? {
            id: -1,
            lat: userPosition[0],
            lon: userPosition[1]
        }
        : null;
    */

    useEffect(() => {
        setUserPosition([56.840508, 60.650206])
    }, [])

    const userPoint = {
        id: -1,
        lat: 56.840508,
        lon: 60.650206
    }

    console.log(userPoint)



    const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="marker-inner"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const userIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="user-marker-inner"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });


    console.log(points);
    return (
        <div className={styles.map}>
            {userPoint && <Ymap
                initialCenter={userPoint===null ? [55.755864, 37.617698] : [userPoint.lat, userPoint.lon] }
                Markers={
                    <>
                        {points.map((point, index) => (
                            <Marker
                                key={index}
                                position={[point.latitude, point.longitude]}
                                icon={customIcon}
                            >
                                <Popup>Себе по ебучке тыкни, пес</Popup>
                            </Marker>
                        ))}

                        {userPosition && (
                            <Marker position={userPosition} icon={userIcon}>
                                <Popup>U</Popup>
                            </Marker>
                        )}
                    </>
                }
                routePoints={points}
                startPoint={userPoint}
            />}
        </div>
    )
}

export default Map;