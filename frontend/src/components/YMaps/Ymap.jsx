import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Marker from "./Marker/Marker"



//TODO add routes

const Ymap = ({ points }) => {
    const [components, setComponents] = useState(null);

    useEffect(() => {
        const init = async () => {
            ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
                '@yandex/ymaps3-default-ui-theme@latest'
            ]);


            const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);
            const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);

            const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapControls, YMapFeature, YMapMarker} = reactify.module(ymaps3);
            const {YMapRouteControl, YMapDefaultMarker} = reactify.module(
                await ymaps3.import('@yandex/ymaps3-default-ui-theme')
            );

            setComponents({
                YMap,
                YMapDefaultSchemeLayer,
                YMapDefaultFeaturesLayer,
                YMapMarker,
                YMapControls,
                YMapRouteControl
            });
        };

        init();
    }, []);


    if (!components) return <div>Loading map...</div>;

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapControls, YMapRouteControl } = components;


    return (
        <YMap location={{ center: [37.588144, 55.733842], zoom: 12 }}>
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />
            {points.map(point => (
                <Marker key={point.id} point={point} YMapMarker={YMapMarker} />
            ))}
            <YMapControls position="top left">
                <YMapRouteControl
                    waypoints={[
                        [37.588144, 55.733842],
                        [37.617635, 55.755814]
                    ]}
                />
            </YMapControls>
        </YMap>
    );
};

export default Ymap;