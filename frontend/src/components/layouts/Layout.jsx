import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import NavigationBar from './NavigationBar/NavigationBar';
import RouteMapView from '../map/RouteMapView';
import YandexMetrikaTracker from '../../analytics/YandexMetrikaTracker';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import layoutStyles from './layout.module.scss';

const Layout = () => {
    const isDesktop = useIsDesktop();

    return (
        <div className={layoutStyles.layout}>
            <YandexMetrikaTracker />
            <div className={layoutStyles.mobileHeader}>
                <Header />
            </div>

            <div className={layoutStyles.body}>
                <aside className={layoutStyles.sidebar}>
                    <div className={layoutStyles.desktopHeader}>
                        <Header />
                    </div>

                    <div className={layoutStyles.sidebarContent}>
                        <Outlet />
                    </div>

                    <NavigationBar variant="desktop" />
                </aside>

                {isDesktop && (
                    <div className={layoutStyles.mapPane}>
                        <RouteMapView />
                    </div>
                )}
            </div>

            <NavigationBar variant="mobile" />
        </div>
    );
};

export default Layout;
