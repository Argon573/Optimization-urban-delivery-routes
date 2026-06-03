import { Navigate } from 'react-router-dom';
import Map from '../YMaps/Map';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import layoutStyles from './layout.module.scss';

const HomeRoute = () => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <Navigate to="/route" replace />;
    }

    return (
        <div className={layoutStyles.mobileMapPanel}>
            <Map />
        </div>
    );
};

export default HomeRoute;
