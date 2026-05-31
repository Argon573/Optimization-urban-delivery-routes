import { usePoints } from './PointsContext';
import styles from "./routescreen.module.scss";
import PointList from "./PointForm/PointList";
import Form from "./Form/Form";
import TransportSelect from "./TransportSelect/TransportSelect";

const RouteScreen = () => {
    const { points, addPoint, transportProfile, setTransportProfile } = usePoints();

    return (
        <div className={styles.container}>
            <Form
                title="Отправная точка"
                placeholder="Мое местоположение"
            />

            <TransportSelect
                value={transportProfile}
                onChange={setTransportProfile}
            />


            <div className={styles.listContainer}>
                <h3>Точки маршрута</h3>

                <PointList
                    points={points}
                    addPoint={addPoint}
                />
            </div>


        </div>
    );
};

export default RouteScreen;