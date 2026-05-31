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
    const [routeGeoJson, setRouteGeoJson] = useState(null);
    const [transportProfile, setTransportProfile] = useState('car');

    const addPoint = (point) => {
        setPoints(prev => [...prev, { ...point, id: Date.now() }]);
        setRouteGeoJson(null);
    };

    const removePoint = (id) => {
        setPoints(prev => prev.filter(point => point.id !== id));
        setRouteGeoJson(null);
    };

    const updateTransportProfile = (profile) => {
        setTransportProfile(profile);
        setRouteGeoJson(null);
    };

    const setGeneratedPoints = (newPoints) => {
        setPoints(newPoints);
        setRouteGeoJson(null);
    };

    return (
        <PointsContext.Provider value={{
            points,
            addPoint,
            removePoint,
            routeGeoJson,
            setRouteGeoJson,
            transportProfile,
            setTransportProfile: updateTransportProfile,
            setGeneratedPoints,
        }}>
            {children}
        </PointsContext.Provider>
    );
};