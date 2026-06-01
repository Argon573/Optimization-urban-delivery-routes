import { usePoints } from './PointsContext';
import layoutStyles from '../layouts/layout.module.scss';
import styles from "./routescreen.module.scss";
import PointList from "./PointForm/PointList";
import StartPointForm from "./StartPointForm/StartPointForm";
import TransportSelect from "./TransportSelect/TransportSelect";

const RouteScreen = () => {
    const { points, addPoint, removePoint, transportProfile, setTransportProfile } = usePoints();

    return (
        <div className={layoutStyles.pagePanel}>
            <div className={layoutStyles.pageContent}>
                <StartPointForm />

                <TransportSelect
                    value={transportProfile}
                    onChange={setTransportProfile}
                />

                <div className={styles.listContainer}>
                    <h3>Точки маршрута</h3>

                    <PointList
                        points={points}
                        addPoint={addPoint}
                        removePoint={removePoint}
                    />
                </div>
            </div>
        </div>
    );
};

export default RouteScreen;