// App.jsx
import React, { useState } from 'react';
import DeliveryMap from './components/deliveryMap';

const App = () => {
  // Состояние для хранения точек доставки
  const [deliveryPoints, setDeliveryPoints] = useState([]);

  // Функция для добавления новой точки
  const addDeliveryPoint = () => {
    const newPoint = {
      id: Date.now(), // уникальный id
      coords: [37.618423 + (Math.random() - 0.5) * 0.1, 55.751244 + (Math.random() - 0.5) * 0.1],
      title: `Новый магазин ${deliveryPoints.length + 1}`
    };
    setDeliveryPoints([...deliveryPoints, newPoint]);
  };

  // Функция для удаления последней точки
  const removeLastPoint = () => {
    if (deliveryPoints.length > 0) {
      setDeliveryPoints(deliveryPoints.slice(0, -1));
    }
  };

  // Функция для очистки всех точек
  const clearAllPoints = () => {
    setDeliveryPoints([]);
  };

  // Функция для сброса к начальным точкам
  const resetPoints = () => {
    setDeliveryPoints([]);
  };

  return (
      <div>
        <div style={{ padding: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={addDeliveryPoint}>➕ Добавить точку</button>
          <button onClick={removeLastPoint}>➖ Удалить последнюю</button>
          <button onClick={clearAllPoints}>🗑️ Очистить все</button>
          <button onClick={resetPoints}>🔄 Сбросить</button>
        </div>

        <div style={{ padding: '10px' }}>
          <strong>Количество точек доставки: {deliveryPoints.length}</strong>
          <ul>
            {deliveryPoints.map(point => (
                <li key={point.id}>{point.title}</li>
            ))}
          </ul>
        </div>

        <DeliveryMap
            deliveryPoints={deliveryPoints}
            // warehouse можно тоже передать, если нужно менять
            // warehouse={[37.618423, 55.751244]}
        />
      </div>
  );
};

export default App;