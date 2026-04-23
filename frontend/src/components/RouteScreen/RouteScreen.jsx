import { usePoints } from './PointsContext';
import styles from "./routescreen.module.scss";
import PointList from "./PointForm/PointList";
import Form from "./Form/Form";

const RouteScreen = () => {
    const { points, addPoint } = usePoints();

    return (
        <div className={styles.container}>
            <Form
                title="Отправная точка"
                placeholder="Мое местоположение"
            />

            <Form
                title="Вид транспорта"
                placeholder="Автомобиль"
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