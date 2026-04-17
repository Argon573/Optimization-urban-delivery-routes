import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Panel from './navigatePanel/Panel';

const Layout = () => {
    return (
        <>
            <Header />
                <Outlet />
            <Panel />
        </>
    );
};

export default Layout;