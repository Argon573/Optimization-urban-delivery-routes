import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RouteScreen from '../components/RouteScreen/RouteScreen';
import Settings from '../components/settings/Settings';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import Layout from '../components/layouts/Layout';
import HomeRoute from '../components/layouts/HomeRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <NotFoundPage />,
        children: [
            {
                index: true,
                element: <HomeRoute />,
            },
            {
                path: '/route',
                element: <RouteScreen />,
            },
            {
                path: '/settings',
                element: <Settings />,
            },
        ],
    },
]);

export const AppRouter = () => <RouterProvider router={router} />;
