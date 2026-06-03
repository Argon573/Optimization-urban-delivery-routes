import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RouteScreen from "../components/RouteScreen/RouteScreen";
import Settings from "../components/settings/Settings";
import Screen404 from "../components/Errors/404 Screen/Screen404";
import Layout from "../components/layouts/Layout";
import HomeRoute from "../components/layouts/HomeRoute";
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <Screen404/>,
        children: [
            {
                index: true,
                element: <HomeRoute/>,
            },
            {
                path: "/route",
                element: <RouteScreen/>,
            },
            {
                path: "/settings",
                element: <Settings/>,
            },
        ]
        }
    ]
)
export const AppRouter = () => {
    return <RouterProvider router={router} />;
};