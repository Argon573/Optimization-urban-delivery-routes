import { usePoints } from './PointsContext';
import styles from "./routescreen.module.scss";
import PointForm from "./PointForm/PointForm";
import PointList from "./PointForm/PointList";
import StartPointForm from './Start Point Form/StartPointForm'

const RouteScreen = () => {
    const { points, addPoint } = usePoints();

    return (
        <div className={styles.container}>
            <StartPointForm />
            <div className={styles.listContainer}>
                <h3>Точки маршрута</h3>

                <PointList points={points} />
            </div>

            <PointForm onSelect={addPoint} />
        </div>
    );
};

export default RouteScreen;