import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Marker from "./Marker/Marker";

//TODO add routes

const Ymap = ({ points }) => {
    const [components, setComponents] = useState(null);

    useEffect(() => {
        const init = async () => {
            const ymaps3Reactify = await ymaps3.import('@yandex/ymaps3-reactify');
            const reactify = ymaps3Reactify.reactify.bindTo(React, ReactDOM);

            const {
                YMap,
                YMapDefaultSchemeLayer,
                YMapDefaultFeaturesLayer,
                YMapMarker
            } = reactify.module(ymaps3);

            setComponents({
                YMap,
                YMapDefaultSchemeLayer,
                YMapDefaultFeaturesLayer,
                YMapMarker
            });
        };

        init();
    }, []);

    if (!components) return <div>Loading map...</div>;

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = components;

    return (
        <YMap location={{ center: [37.588144, 55.733842], zoom: 12 }}>
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />
            {points.map(point => (
                <Marker key={point.id} point={point} YMapMarker={YMapMarker} />
            ))}
        </YMap>
    );
};

export default Ymap;