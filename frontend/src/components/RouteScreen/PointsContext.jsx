import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('usePoints must be used within PointsProvider');
    }
    return context;
};

export const PointsProvider = ({ children }) => {
    const [points, setPoints] = useState([]);
    const [routeGeoJson, setRouteGeoJson] = useState(null); // 👈 добавили

    const addPoint = (point) => {
        setPoints(prev => [...prev, { ...point, id: Date.now() }]);
        setRouteGeoJson(null); // 👈 сбрасываем маршрут при изменении точек
    };

    const removePoint = (id) => {
        setPoints(prev => prev.filter(point => point.id !== id));
        setRouteGeoJson(null); // 👈 тоже сбрасываем
    };

    return (
        <PointsContext.Provider value={{
            points,
            addPoint,
            removePoint,
            routeGeoJson,
            setRouteGeoJson // 👈 пробрасываем наружу
        }}>
            {children}
        </PointsContext.Provider>
    );
};