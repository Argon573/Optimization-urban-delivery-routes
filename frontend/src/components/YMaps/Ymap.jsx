import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ymap.css";
import { getMap } from "../../hooks/getMap";

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
const DataLayer = ({ bbox, onLoad, onError, setLoading }) => {
    const [geojson, setGeojson] = useState(null);
    const map = useMap();

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const data = await getMap(bbox);
                setGeojson(data);
                onLoad(data);
                console.log("Данные загружены:", data.features?.length || 0);
            } catch (e) {
                console.error(e);
                onError(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [bbox]);

    return geojson ? (
        <GeoJSON
            data={geojson}
            filter={(f) => f.geometry.type !== "Polygon" && f.geometry.type !== "LineString" && f.geometry.type !== "Point"}
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
                  initialBbox = "-0.489,51.369,0.236,51.569",
                  initialCenter = [51.469, -0.1265],
                  initialZoom = 13,
                  onLoad = () => console.log("Successful load map!"),
                  onError = () => console.log("Error loading map!"),
                  Markers
              }) => {
    const [bbox, setBbox] = useState(initialBbox);
    const [loading, setLoading] = useState(false);

    const updateBbox = (newBbox) => {
        setBbox(newBbox);
    };

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
                {Markers}
                <DataLayer
                    bbox={bbox}
                    onLoad={onLoad}
                    onError={onError}
                    setLoading={setLoading}
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