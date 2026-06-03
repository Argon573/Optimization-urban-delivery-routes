import { useState, useCallback } from 'react';
import { usePoints } from './RouteScreen/PointsContext';
import { shouldShowGeoPrompt, setGeoConsent } from '../services/geoConsent';
import GeoPermissionModal from './modals/GeoPermissionModal';
import RouteBuildModal from './modals/RouteBuildModal';

const AppShell = ({ children }) => {
    const {
        isBuilding,
        buildProgress,
        applyUserLocation,
        setGeolocationStatus,
    } = usePoints();

    const [showGeoPrompt, setShowGeoPrompt] = useState(() => shouldShowGeoPrompt());

    const handleAllowGeo = useCallback(async () => {
        setGeoConsent('granted');
        setShowGeoPrompt(false);
        await applyUserLocation();
    }, [applyUserLocation]);

    const handleLaterGeo = useCallback(() => {
        setGeoConsent('later');
        setGeolocationStatus('denied');
        setShowGeoPrompt(false);
    }, [setGeolocationStatus]);

    return (
        <>
            {children}
            {showGeoPrompt && (
                <GeoPermissionModal
                    onAllow={handleAllowGeo}
                    onLater={handleLaterGeo}
                />
            )}
            {isBuilding && <RouteBuildModal progress={buildProgress} />}
        </>
    );
};

export default AppShell;
