import { useRoute } from '../../context/RouteContext';
import layoutStyles from '../layouts/layout.module.scss';
import styles from './RouteScreen.module.scss';
import WaypointList from './waypoints/WaypointList';
import WaypointInput from './waypoints/WaypointInput';
import StartPointForm from './StartPointForm/StartPointForm';
import TransportSelect from './TransportSelect/TransportSelect';
import RouteActions from './RouteActions/RouteActions';

const RouteScreen = () => {
    const { points, addPoint, removePoint, transportProfile, setTransportProfile } = useRoute();

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
                        <WaypointList
                            points={points}
                            removePoint={removePoint}
                        />
                    )}

                    <WaypointInput onSelect={addPoint} />
                </div>

                <RouteActions />
            </div>
        </div>
    );
};

export default RouteScreen;
