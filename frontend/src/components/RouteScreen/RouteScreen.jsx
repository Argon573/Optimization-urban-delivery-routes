import { usePoints } from './PointsContext';
import styles from "./routescreen.module.scss";
import PointForm from "./PointForm/PointForm";
import PointList from "./PointForm/PointList";

const RouteScreen = () => {
    const { points, addPoint } = usePoints();

    return (
        <div className={styles.container}>
            <div className={styles.listContainer}>
                <h3>Сохраненные точки ({points.length}):</h3>

                <PointList points={points} />
            </div>

            <PointForm onSelect={addPoint} />
        </div>
    );
};

export default RouteScreen;