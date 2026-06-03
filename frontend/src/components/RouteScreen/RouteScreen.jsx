import { usePoints } from './PointsContext';
import layoutStyles from '../layouts/layout.module.scss';
import styles from "./routescreen.module.scss";
import PointList from "./PointForm/PointList";
import PointForm from "./PointForm/PointForm";
import StartPointForm from "./StartPointForm/StartPointForm";
import TransportSelect from "./TransportSelect/TransportSelect";
import RouteActions from "./RouteActions/RouteActions";

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

                    {points.length > 0 && (
                        <PointList
                            points={points}
                            removePoint={removePoint}
                        />
                    )}

                    <PointForm onSelect={addPoint} />
                </div>

                <RouteActions />
            </div>
        </div>
    );
};

export default RouteScreen;