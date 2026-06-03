import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Panel from './navigatePanel/Panel';
import Map from '../YMaps/Map';
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

                    <Panel variant="desktop" />
                </aside>

                <div className={layoutStyles.mapPane}>
                    <Map />
                </div>
            </div>

            <Panel variant="mobile" />
        </div>
    );
};

export default Layout;
