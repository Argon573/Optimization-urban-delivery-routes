import { usePoints } from './PointsContext';
import styles from "./routescreen.module.scss";
import { useState } from "react";

const RouteScreen = () => {
    // Получаем из контекста И точки, И функцию для добавления
    const { points, addPoint } = usePoints(); // ← добавляем points
    const [coordinates, setCoordinates] = useState({
        latitude: '',
        longitude: ''
    });

    // Обработчик изменения полей ввода
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCoordinates(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валидация
        if (!coordinates.latitude || !coordinates.longitude) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        // Добавляем точку через контекст
        addPoint({
            latitude: parseFloat(coordinates.latitude),
            longitude: parseFloat(coordinates.longitude)
        });

        // Очищаем форму
        setCoordinates({ latitude: '', longitude: '' });
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Широта:</label>
                    <input
                        type="number"
                        name="latitude"
                        value={coordinates.latitude}
                        onChange={handleChange}  // ← ДОБАВИТЬ ЭТО!
                        step="any"
                        placeholder="например: 55.751244"
                    />
                </div>

                <div>
                    <label>Долгота:</label>
                    <input
                        type="number"
                        name="longitude"
                        value={coordinates.longitude}
                        onChange={handleChange}  // ← ДОБАВИТЬ ЭТО!
                        step="any"
                        placeholder="например: 37.618423"
                    />
                </div>

                <button type="submit">Добавить координаты</button>
            </form>

            {/* Список добавленных координат - используем points из контекста */}
            <div>
                <h3>Сохраненные координаты ({points.length}):</h3>
                {points.length === 0 ? (
                    <p>Нет добавленных координат</p>
                ) : (
                    <ul>
                        {points.map(coord => (
                            <li key={coord.id}>
                                📍 {coord.latitude}, {coord.longitude}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default RouteScreen;