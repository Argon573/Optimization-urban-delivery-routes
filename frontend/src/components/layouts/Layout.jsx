import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Panel from './navigatePanel/Panel';
import layoutStyles from './layout.module.scss';

const Layout = () => {
    return (
        <div className={layoutStyles.layout}>
            <Header />
            <main className={layoutStyles.main}>
                <Outlet />
            </main>
            <Panel />
        </div>
    );
};

export default Layout;