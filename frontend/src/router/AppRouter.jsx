import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RouteScreen from "../components/RouteScreen/RouteScreen";
import Settings from "../components/settings/Settings";
import Screen404 from "../components/Errors/404 Screen/Screen404";
import Layout from "../components/layouts/Layout";
import Map from "../components/YMaps/Map";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <Screen404 />,
        children: [
            {
                index: true,
                element: <Map />,
            },
            {
                path: "/route",
                element: <RouteScreen />,
            }
        ]
    }
])
export const AppRouter = () => {
    return <RouterProvider router={router} />;
};