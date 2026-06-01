import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getUserPosition } from '../../hooks/getUserPosition';

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
    const [startPoint, setStartPointState] = useState(null);
    const [geolocationStatus, setGeolocationStatus] = useState('pending');

    const invalidateRoute = useCallback(() => {
        invalidateRouteCache(setRouteGeoJson, setRouteCacheKey);
    }, []);

    const cacheRoute = useCallback((geojson, cacheKey) => {
        setRouteGeoJson(geojson);
        setRouteCacheKey(cacheKey);
    }, []);

    useEffect(() => {
        getUserPosition()
            .then(([latitude, longitude]) => {
                setGeolocationStatus('granted');
                setStartPointState({
                    id: 'start',
                    address: 'Мое местоположение',
                    latitude,
                    longitude,
                    isUserLocation: true,
                });
            })
            .catch(() => {
                setGeolocationStatus('denied');
            });
    }, []);

    const setStartPoint = useCallback((point) => {
        setStartPointState(point);
        invalidateRoute();
    }, [invalidateRoute]);

    const applyUserLocation = useCallback(async () => {
        try {
            const [latitude, longitude] = await getUserPosition();
            setGeolocationStatus('granted');
            setStartPointState({
                id: 'start',
                address: 'Мое местоположение',
                latitude,
                longitude,
                isUserLocation: true,
            });
            invalidateRoute();
            return true;
        } catch {
            setGeolocationStatus('denied');
            return false;
        }
    }, [invalidateRoute]);

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

    const apiStartPoint = startPoint
        ? {
            id: -1,
            lat: startPoint.latitude,
            lon: startPoint.longitude,
        }
        : null;

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
            startPoint,
            setStartPoint,
            geolocationStatus,
            apiStartPoint,
            applyUserLocation,
        }}>
            {children}
        </PointsContext.Provider>
    );
};
