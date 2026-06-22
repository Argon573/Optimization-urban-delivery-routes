import React, {
    createContext, useContext, useState, useCallback, useEffect, useRef,
} from 'react';
import { getUserGeolocation } from '../api/getUserGeolocation';
import { fetchRouteGeoJson } from '../api/fetchRouteGeoJson';
import { buildRouteCacheKey } from '../utils/routeCacheKey';
import { runSimulatedProgress } from '../utils/simulatedProgress';
import { saveToHistory, formatRouteLabel } from '../services/routeStorage';
import { POINT_PRIORITIES } from '../constants/pointPriority';
import { ROUTE_POINTS_MAX } from '../constants/routeLimits';
import { resolvePointName } from '../utils/pointName';
import { useNetworkQuality } from '../hooks/useNetworkQuality';

const RouteContext = createContext();
const AUTO_BUILD_DEBOUNCE_MS = 450;

function toApiPointId(id, fallbackIndex) {
    if (Number.isInteger(id)) {
        return id;
    }
    const parsed = Number(id);
    if (Number.isInteger(parsed) && !Number.isNaN(parsed)) {
        return parsed;
    }
    return fallbackIndex + 1;
}

function mapPointsForRoute(points) {
    return points.map((point, index) => ({
        id: toApiPointId(point.id, index),
        lat: point.latitude,
        lon: point.longitude,
        priority: point.priority ?? POINT_PRIORITIES.NORMAL,
    }));
}

const invalidateRouteCache = (setRouteGeoJson, setRouteCacheKey, refs) => {
    if (refs) {
        refs.routeGeoJsonRef.current = null;
        refs.routeCacheKeyRef.current = null;
    }
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
    const {
        isStable,
        isWeak,
        isChecking: isNetworkChecking,
        quality: networkQuality,
    } = useNetworkQuality();

    const [points, setPoints] = useState([]);
    const [routeGeoJson, setRouteGeoJson] = useState(null);
    const [routeCacheKey, setRouteCacheKey] = useState(null);
    const [transportProfile, setTransportProfile] = useState('car');
    const [startPoint, setStartPointState] = useState(null);
    const [geolocationStatus, setGeolocationStatus] = useState('idle');
    const [isBuilding, setIsBuilding] = useState(false);
    const [isAutoBuilding, setIsAutoBuilding] = useState(false);
    const [buildProgress, setBuildProgress] = useState(0);
    const [buildError, setBuildError] = useState(null);
    const [mapFocus, setMapFocus] = useState(null);
    const [selectedPointId, setSelectedPointId] = useState(null);

    const pointsRef = useRef(points);
    const startPointRef = useRef(startPoint);
    const transportProfileRef = useRef(transportProfile);
    pointsRef.current = points;
    startPointRef.current = startPoint;
    transportProfileRef.current = transportProfile;
    const autoBuildAbortRef = useRef(null);
    const autoBuildRequestIdRef = useRef(0);
    const autoBuildTimerRef = useRef(null);
    const nextPointIdRef = useRef(Date.now());
    const routeCacheKeyRef = useRef(null);
    const routeGeoJsonRef = useRef(null);
    const isStableRef = useRef(isStable);
    isStableRef.current = isStable;

    const cacheRefs = { routeGeoJsonRef, routeCacheKeyRef };

    const invalidateRoute = useCallback(() => {
        invalidateRouteCache(setRouteGeoJson, setRouteCacheKey, cacheRefs);
    }, []);

    const invalidateRouteIfStale = useCallback(() => {
        const currentStart = startPointRef.current
            ? { lat: startPointRef.current.latitude, lon: startPointRef.current.longitude }
            : null;
        const nextKey = buildRouteCacheKey(
            pointsRef.current,
            transportProfileRef.current,
            currentStart,
        );

        if (!routeCacheKeyRef.current || nextKey !== routeCacheKeyRef.current) {
            invalidateRoute();
        }
    }, [invalidateRoute]);

    const cacheRoute = useCallback((geojson, cacheKey) => {
        const currentStart = startPointRef.current
            ? { lat: startPointRef.current.latitude, lon: startPointRef.current.longitude }
            : null;
        const currentKey = buildRouteCacheKey(
            pointsRef.current,
            transportProfileRef.current,
            currentStart,
        );

        if (cacheKey !== currentKey) {
            return;
        }

        routeGeoJsonRef.current = geojson;
        routeCacheKeyRef.current = cacheKey;
        setRouteGeoJson(geojson);
        setRouteCacheKey(cacheKey);
    }, []);

    const setStartPoint = useCallback((point) => {
        setStartPointState(point);
        startPointRef.current = point;
        invalidateRouteIfStale();
    }, [invalidateRouteIfStale]);

    const applyUserLocation = useCallback(async () => {
        try {
            const [latitude, longitude] = await getUserGeolocation();
            setGeolocationStatus('granted');
            const nextStart = {
                id: 'start',
                address: 'Мое местоположение',
                latitude,
                longitude,
                isUserLocation: true,
            };
            startPointRef.current = nextStart;
            setStartPointState(nextStart);
            invalidateRouteIfStale();
            return true;
        } catch {
            setGeolocationStatus('denied');
            return false;
        }
    }, [invalidateRouteIfStale]);

    const addPoint = useCallback((point) => {
        if (pointsRef.current.length >= ROUTE_POINTS_MAX) {
            return false;
        }

        setPoints((prev) => {
            if (prev.length >= ROUTE_POINTS_MAX) {
                return prev;
            }

            const next = [...prev, {
                ...point,
                id: point.id ?? (nextPointIdRef.current += 1),
                name: resolvePointName(point),
                priority: point.priority ?? POINT_PRIORITIES.NORMAL,
            }];
            pointsRef.current = next;
            return next;
        });
        invalidateRouteIfStale();
        return true;
    }, [invalidateRouteIfStale]);

    const updatePoint = useCallback((id, updates) => {
        setPoints((prev) => {
            const next = prev.map((point) => (
                point.id === id ? { ...point, ...updates } : point
            ));
            pointsRef.current = next;
            return next;
        });
        invalidateRouteIfStale();
    }, [invalidateRouteIfStale]);

    const removePoint = useCallback((id) => {
        setPoints((prev) => {
            const next = prev.filter((point) => point.id !== id);
            pointsRef.current = next;
            return next;
        });
        invalidateRouteIfStale();
    }, [invalidateRouteIfStale]);

    const updateTransportProfile = useCallback((profile) => {
        const normalized = profile === 'transit' ? 'car' : profile;
        setTransportProfile(normalized);
        invalidateRouteIfStale();
    }, [invalidateRouteIfStale]);

    const setGeneratedPoints = useCallback((newPoints) => {
        const limitedPoints = newPoints.slice(0, ROUTE_POINTS_MAX);
        const maxId = limitedPoints.reduce(
            (max, point) => Math.max(max, typeof point.id === 'number' ? point.id : 0),
            nextPointIdRef.current,
        );
        nextPointIdRef.current = maxId;
        pointsRef.current = limitedPoints;
        setPoints(limitedPoints);
        invalidateRouteIfStale();
    }, [invalidateRouteIfStale]);

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

    const prepareRouteRequest = useCallback(() => {
        const currentStart = startPoint
            ? { id: -1, lat: startPoint.latitude, lon: startPoint.longitude }
            : null;

        const cacheKey = buildRouteCacheKey(points, transportProfile, currentStart);
        const pointsForRoute = mapPointsForRoute(points);

        return { currentStart, cacheKey, pointsForRoute };
    }, [points, startPoint, transportProfile]);

    const requestRoute = useCallback(async ({
        mode = 'manual',
        saveHistory = mode === 'manual',
        signal,
    } = {}) => {
        if (points.length < 2) {
            throw new Error('Добавьте минимум 2 точки маршрута');
        }

        const { currentStart, cacheKey, pointsForRoute } = prepareRouteRequest();

        if (cacheKey === routeCacheKey && routeGeoJson) {
            return routeGeoJson;
        }

        const isAuto = mode === 'auto';
        const lite = isWeak && !isAuto;

        setBuildError(null);

        if (isAuto) {
            setIsAutoBuilding(true);
        } else {
            setIsBuilding(true);
            setBuildProgress(0);
            invalidateRoute();
        }

        try {
            const fetchPromise = fetchRouteGeoJson(
                currentStart,
                null,
                pointsForRoute,
                transportProfile,
                { lite, signal },
            );

            const geojson = isAuto
                ? await fetchPromise
                : (await Promise.all([
                    runSimulatedProgress(2000, setBuildProgress),
                    fetchPromise,
                ]))[1];

            if (signal?.aborted) {
                return null;
            }

            cacheRoute(geojson, cacheKey);

            if (saveHistory) {
                saveToHistory({
                    id: `h_${Date.now()}`,
                    createdAt: Date.now(),
                    label: formatRouteLabel({ createdAt: Date.now(), points }),
                    startPoint,
                    points: [...points],
                    transportProfile,
                });
            }

            return geojson;
        } catch (err) {
            if (err.name === 'AbortError' || signal?.aborted) {
                return null;
            }
            if (!signal?.aborted) {
                setBuildError(err.message || 'Не удалось построить маршрут');
            }
            throw err;
        } finally {
            if (isAuto) {
                setIsAutoBuilding(false);
            } else {
                setBuildProgress(100);
                setTimeout(() => {
                    setIsBuilding(false);
                    setBuildProgress(0);
                }, 200);
            }
        }
    }, [
        points,
        startPoint,
        transportProfile,
        routeCacheKey,
        routeGeoJson,
        isWeak,
        invalidateRoute,
        cacheRoute,
        prepareRouteRequest,
    ]);

    const buildRoute = useCallback(
        () => requestRoute({ mode: 'manual', saveHistory: true }),
        [requestRoute],
    );

    useEffect(() => {
        if (!isStable || points.length < 2) {
            return undefined;
        }

        const currentStart = startPoint
            ? { id: -1, lat: startPoint.latitude, lon: startPoint.longitude }
            : null;
        const cacheKey = buildRouteCacheKey(points, transportProfile, currentStart);

        if (cacheKey === routeCacheKeyRef.current && routeGeoJsonRef.current) {
            return undefined;
        }

        clearTimeout(autoBuildTimerRef.current);
        autoBuildRequestIdRef.current += 1;
        autoBuildAbortRef.current?.abort();

        autoBuildTimerRef.current = setTimeout(async () => {
            const requestId = autoBuildRequestIdRef.current + 1;
            autoBuildRequestIdRef.current = requestId;

            const controller = new AbortController();
            autoBuildAbortRef.current = controller;

            const latestPoints = pointsRef.current;
            const latestStartPoint = startPointRef.current;
            const latestTransport = transportProfileRef.current;

            if (latestPoints.length < 2) {
                return;
            }

            const latestStart = latestStartPoint
                ? { id: -1, lat: latestStartPoint.latitude, lon: latestStartPoint.longitude }
                : null;
            const latestCacheKey = buildRouteCacheKey(latestPoints, latestTransport, latestStart);

            if (latestCacheKey === routeCacheKeyRef.current && routeGeoJsonRef.current) {
                return;
            }

            const pointsForRoute = mapPointsForRoute(latestPoints);

            setBuildError(null);
            setIsAutoBuilding(true);

            try {
                const geojson = await fetchRouteGeoJson(
                    latestStart,
                    null,
                    pointsForRoute,
                    latestTransport,
                    { signal: controller.signal },
                );

                if (requestId !== autoBuildRequestIdRef.current) {
                    return;
                }

                if (controller.signal.aborted) {
                    return;
                }

                cacheRoute(geojson, latestCacheKey);
            } catch (err) {
                if (err.name === 'AbortError' || controller.signal.aborted) {
                    return;
                }
                if (requestId === autoBuildRequestIdRef.current) {
                    setBuildError(err.message || 'Не удалось построить маршрут');
                }
            } finally {
                if (requestId === autoBuildRequestIdRef.current) {
                    setIsAutoBuilding(false);
                }
            }
        }, AUTO_BUILD_DEBOUNCE_MS);

        return () => {
            clearTimeout(autoBuildTimerRef.current);
        };
    }, [
        isStable,
        points,
        startPoint,
        transportProfile,
        cacheRoute,
    ]);

    useEffect(() => {
        if (isWeak) {
            autoBuildRequestIdRef.current += 1;
            autoBuildAbortRef.current?.abort();
            clearTimeout(autoBuildTimerRef.current);
            setIsAutoBuilding(false);
        }
    }, [isWeak]);

    const resetAll = useCallback(async () => {
        autoBuildRequestIdRef.current += 1;
        autoBuildAbortRef.current?.abort();
        clearTimeout(autoBuildTimerRef.current);
        setPoints([]);
        pointsRef.current = [];
        invalidateRoute();
        setBuildError(null);
        setIsAutoBuilding(false);

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
            routePointsMax: ROUTE_POINTS_MAX,
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
            isAutoBuilding,
            buildProgress,
            buildError,
            mapFocus,
            focusOnMap,
            selectedPointId,
            openPointSettings,
            closePointSettings,
            networkQuality,
            isStableNetwork: isStable,
            isWeakNetwork: isWeak,
            isNetworkChecking,
            isAutoRouteEnabled: isStable,
        }}>
            {children}
        </RouteContext.Provider>
    );
};
