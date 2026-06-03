import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import NavigationBar from './NavigationBar/NavigationBar';
import RouteMapView from '../map/RouteMapView';
import layoutStyles from './layout.module.scss';

const Layout = () => {
    return (
        <div className={layoutStyles.layout}>
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

                <div className={layoutStyles.mapPane}>
                    <RouteMapView />
                </div>
            </div>

            <NavigationBar variant="mobile" />
        </div>
    );
};

export default Layout;
