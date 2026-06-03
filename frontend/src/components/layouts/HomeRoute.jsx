import { Navigate } from 'react-router-dom';
import RouteMapView from '../map/RouteMapView';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import layoutStyles from './layout.module.scss';

const HomeRoute = () => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <Navigate to="/route" replace />;
    }

    return (
        <div className={layoutStyles.mobileMapPanel}>
            <RouteMapView />
        </div>
    );
};

export default HomeRoute;
