import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ymap.css";
import { getMap } from "../../hooks/getMap";
import CustomZoomControl from "./custom control/CustomZoomControl";
import styles from "./custom control/customZoomControl.module.scss";

// Фикс иконок
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Компонент для обновления данных при bbox
const DataLayer = ({ onLoad, onError, setLoading, routePoints, startPoint, endPoint }) => {
    const [geojson, setGeojson] = useState(null);

    useEffect(() => {
        const load = async () => {

            if (!routePoints || routePoints.length < 2) {
                console.log("Недостаточно точек для маршрута");
                return;
            }

            setLoading(true);

            try {
                const pointsForRoute = routePoints.map((point, index) => ({
                    id: index,
                    lat: point.latitude,
                    lon: point.longitude
                }));

                const data = await getMap(startPoint, endPoint, pointsForRoute);

                setGeojson(data);
                onLoad(data);
            } catch (e) {
                console.error(e);
                onError(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [routePoints]);

    return geojson ? (
        <GeoJSON
            data={geojson}
            filter={(f) => {
                const type = f?.geometry?.type;
                return type && type !== "Polygon" && type !== "Point";
            }}
            style={{ color: "#3388ff", weight: 2 }}
            onEachFeature={(feature, layer) => {
                if (feature.properties?.name) {
                    layer.bindPopup(`
            <strong>${feature.properties.name}</strong><br/>
            Тип: ${feature.properties.type || "не указан"}
          `);
                }
            }}
        />
    ) : null;
};

const Ymap = ({
                  initialBbox = "55.755864, 37.617698",
                  initialCenter,
                  initialZoom = 13,
                  onLoad = () => console.log("Successful load map!"),
                  onError = () => console.log("Error loading map!"),
                  Markers,
                  routePoints = [],
                  startPoint = null,
                  endPoint = null,
              }) => {
    const [bbox, setBbox] = useState(initialBbox);
    const [loading, setLoading] = useState(false);


    return (
        <div className="leaflet" style={{ position: "relative" }}>
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <CustomZoomControl className={styles.customZoomControl} />

                {Markers}
                <DataLayer
                    bbox={bbox}
                    onLoad={onLoad}
                    onError={onError}
                    setLoading={setLoading}
                    routePoints={routePoints}
                    startPoint={startPoint}
                    endPoint={endPoint}
                />
            </MapContainer>

            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                    }}
                >
                    Загрузка...
                </div>
            )}
        </div>
    );
};

export default Ymap;