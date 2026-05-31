import React, { createContext, useContext, useState, useCallback } from 'react';

const PointsContext = createContext();

const invalidateRouteCache = (setRouteGeoJson, setRouteCacheKey) => {
    setRouteGeoJson(null);
    setRouteCacheKey(null);
};

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('usePoints must be used within PointsProvider');
    }
    return context;
};

export const PointsProvider = ({ children }) => {
    const [points, setPoints] = useState([]);
    const [routeGeoJson, setRouteGeoJson] = useState(null);
    const [routeCacheKey, setRouteCacheKey] = useState(null);
    const [transportProfile, setTransportProfile] = useState('car');

    const invalidateRoute = useCallback(() => {
        invalidateRouteCache(setRouteGeoJson, setRouteCacheKey);
    }, []);

    const cacheRoute = useCallback((geojson, cacheKey) => {
        setRouteGeoJson(geojson);
        setRouteCacheKey(cacheKey);
    }, []);

    const addPoint = (point) => {
        setPoints(prev => [...prev, { ...point, id: Date.now() }]);
        invalidateRoute();
    };

    const removePoint = (id) => {
        setPoints(prev => prev.filter(point => point.id !== id));
        invalidateRoute();
    };

    const updateTransportProfile = (profile) => {
        setTransportProfile(profile);
        invalidateRoute();
    };

    const setGeneratedPoints = (newPoints) => {
        setPoints(newPoints);
        invalidateRoute();
    };

    return (
        <PointsContext.Provider value={{
            points,
            addPoint,
            removePoint,
            routeGeoJson,
            routeCacheKey,
            cacheRoute,
            invalidateRoute,
            transportProfile,
            setTransportProfile: updateTransportProfile,
            setGeneratedPoints,
        }}>
            {children}
        </PointsContext.Provider>
    );
};