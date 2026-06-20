import React, { createContext, useContext, useState, useCallback } from 'react';
import { getUserGeolocation } from '../api/getUserGeolocation';
import { fetchRouteGeoJson } from '../api/fetchRouteGeoJson';
import { buildRouteCacheKey } from '../utils/routeCacheKey';
import { runSimulatedProgress } from '../utils/simulatedProgress';
import { saveToHistory, formatRouteLabel } from '../services/routeStorage';
import { POINT_PRIORITIES } from '../constants/pointPriority';
import { resolvePointName } from '../utils/pointName';

const RouteContext = createContext();

const invalidateRouteCache = (setRouteGeoJson, setRouteCacheKey) => {
    setRouteGeoJson(null);
    setRouteCacheKey(null);
};

export const useRoute = () => {
    const context = useContext(RouteContext);
    if (!context) {
        throw new Error('useRoute must be used within RouteProvider');
    }
    return context;
};

export const RouteProvider = ({ children }) => {
    const [points, setPoints] = useState([]);
    const [routeGeoJson, setRouteGeoJson] = useState(null);
    const [routeCacheKey, setRouteCacheKey] = useState(null);
    const [transportProfile, setTransportProfile] = useState('car');
    const [startPoint, setStartPointState] = useState(null);
    const [geolocationStatus, setGeolocationStatus] = useState('idle');
    const [isBuilding, setIsBuilding] = useState(false);
    const [buildProgress, setBuildProgress] = useState(0);
    const [buildError, setBuildError] = useState(null);
    const [mapFocus, setMapFocus] = useState(null);
    const [selectedPointId, setSelectedPointId] = useState(null);

    const invalidateRoute = useCallback(() => {
        invalidateRouteCache(setRouteGeoJson, setRouteCacheKey);
    }, []);

    const cacheRoute = useCallback((geojson, cacheKey) => {
        setRouteGeoJson(geojson);
        setRouteCacheKey(cacheKey);
    }, []);

    const setStartPoint = useCallback((point) => {
        setStartPointState(point);
        invalidateRoute();
    }, [invalidateRoute]);

    const applyUserLocation = useCallback(async () => {
        try {
            const [latitude, longitude] = await getUserGeolocation();
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
        setPoints((prev) => [...prev, {
            ...point,
            id: Date.now(),
            name: resolvePointName(point),
            priority: point.priority ?? POINT_PRIORITIES.NORMAL,
        }]);
        invalidateRoute();
    };

    const updatePoint = useCallback((id, updates) => {
        setPoints((prev) => prev.map((point) => (
            point.id === id ? { ...point, ...updates } : point
        )));
        invalidateRoute();
    }, [invalidateRoute]);

    const removePoint = (id) => {
        setPoints((prev) => prev.filter((point) => point.id !== id));
        invalidateRoute();
    };

    const updateTransportProfile = (profile) => {
        const normalized = profile === 'transit' ? 'car' : profile;
        setTransportProfile(normalized);
        invalidateRoute();
    };

    const setGeneratedPoints = (newPoints) => {
        setPoints(newPoints);
        invalidateRoute();
    };

    const loadRouteSnapshot = useCallback((snapshot) => {
        setPoints((snapshot.points ?? []).map((point) => ({
            ...point,
            name: resolvePointName(point),
            priority: point.priority ?? POINT_PRIORITIES.NORMAL,
        })));
        setStartPointState(snapshot.startPoint ?? null);
        setTransportProfile(
            snapshot.transportProfile === 'transit' ? 'car' : (snapshot.transportProfile ?? 'car'),
        );
        if (snapshot.startPoint?.isUserLocation) {
            setGeolocationStatus('granted');
        }
        invalidateRoute();
    }, [invalidateRoute]);

    const buildRoute = useCallback(async () => {
        if (points.length < 2) {
            throw new Error('Добавьте минимум 2 точки маршрута');
        }

        const currentStart = startPoint
            ? { id: -1, lat: startPoint.latitude, lon: startPoint.longitude }
            : null;

        const cacheKey = buildRouteCacheKey(points, transportProfile, currentStart);
        const pointsForRoute = points.map((point, index) => ({
            id: point.id ?? index,
            lat: point.latitude,
            lon: point.longitude,
            priority: point.priority ?? POINT_PRIORITIES.NORMAL,
        }));

        setBuildError(null);
        setIsBuilding(true);
        setBuildProgress(0);
        invalidateRoute();

        try {
            const [, geojson] = await Promise.all([
                runSimulatedProgress(2000, setBuildProgress),
                fetchRouteGeoJson(currentStart, null, pointsForRoute, transportProfile),
            ]);

            cacheRoute(geojson, cacheKey);

            const snapshot = {
                id: `h_${Date.now()}`,
                createdAt: Date.now(),
                label: formatRouteLabel({ createdAt: Date.now(), points }),
                startPoint,
                points: [...points],
                transportProfile,
            };
            saveToHistory(snapshot);

            return geojson;
        } catch (err) {
            setBuildError(err.message || 'Не удалось построить маршрут');
            throw err;
        } finally {
            setBuildProgress(100);
            setTimeout(() => {
                setIsBuilding(false);
                setBuildProgress(0);
            }, 200);
        }
    }, [points, startPoint, transportProfile, invalidateRoute, cacheRoute]);

    const resetAll = useCallback(async () => {
        setPoints([]);
        invalidateRoute();
        setBuildError(null);

        try {
            const [latitude, longitude] = await getUserGeolocation();
            setGeolocationStatus('granted');
            setStartPointState({
                id: 'start',
                address: 'Мое местоположение',
                latitude,
                longitude,
                isUserLocation: true,
            });
        } catch {
            setGeolocationStatus('denied');
            setStartPointState(null);
        }
    }, [invalidateRoute]);

    const focusOnMap = useCallback((latitude, longitude) => {
        setMapFocus({ latitude, longitude, nonce: Date.now() });
    }, []);

    const openPointSettings = useCallback((id) => {
        setSelectedPointId(id);
    }, []);

    const closePointSettings = useCallback(() => {
        setSelectedPointId(null);
    }, []);

    const apiStartPoint = startPoint
        ? {
            id: -1,
            lat: startPoint.latitude,
            lon: startPoint.longitude,
        }
        : null;

    return (
        <RouteContext.Provider value={{
            points,
            addPoint,
            updatePoint,
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
            setGeolocationStatus,
            apiStartPoint,
            applyUserLocation,
            buildRoute,
            resetAll,
            loadRouteSnapshot,
            isBuilding,
            buildProgress,
            buildError,
            mapFocus,
            focusOnMap,
            selectedPointId,
            openPointSettings,
            closePointSettings,
        }}>
            {children}
        </RouteContext.Provider>
    );
};
