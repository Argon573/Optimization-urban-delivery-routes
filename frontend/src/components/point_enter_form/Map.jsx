// components/deliveryMap/index.jsx
import React, { useState, useCallback, useMemo } from 'react';
import DeliveryMap from './DeliveryMap';
import MapControls from './MapControls';
import PointsList from './PointsList';
import styles from './deliveryMap.module.scss';

// Начальные точки
const INITIAL_POINTS = [
  { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
  { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
  { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
];

const Map = ({
                                center = [37.618423, 55.751244],
                                zoom = 12,
                                warehouse = { coordinates: [37.618423, 55.751244], title: 'Склад' },
                                onPointsChange // колбэк для родителя при изменении точек
                              }) => {
  const [deliveryPoints, setDeliveryPoints] = useState(INITIAL_POINTS);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Мемоизируем координаты склада
  const warehouseCoords = useMemo(() => warehouse.coordinates, [warehouse]);

  // Добавление новой точки
  const addPoint = useCallback(() => {
    setLoading(true);

    // Имитация асинхронной операции
    setTimeout(() => {
      const newPoint = {
        id: Date.now(),
        coords: [
          center[0] + (Math.random() - 0.5) * 0.2,
          center[1] + (Math.random() - 0.5) * 0.2
        ],
        title: `Новый магазин ${deliveryPoints.length + 1}`
      };

      const updatedPoints = [...deliveryPoints, newPoint];
      setDeliveryPoints(updatedPoints);
      setLoading(false);

      if (onPointsChange) {
        onPointsChange(updatedPoints);
      }
    }, 500);
  }, [deliveryPoints, center, onPointsChange]);

  // Удаление последней точки
  const removeLastPoint = useCallback(() => {
    if (deliveryPoints.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const updatedPoints = deliveryPoints.slice(0, -1);
      setDeliveryPoints(updatedPoints);
      setLoading(false);

      if (onPointsChange) {
        onPointsChange(updatedPoints);
      }
    }, 300);
  }, [deliveryPoints, onPointsChange]);

  // Очистка всех точек
  const clearAllPoints = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setDeliveryPoints([]);
      setLoading(false);

      if (onPointsChange) {
        onPointsChange([]);
      }
    }, 300);
  }, [onPointsChange]);

  // Сброс к начальным точкам
  const resetPoints = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setDeliveryPoints(INITIAL_POINTS);
      setLoading(false);

      if (onPointsChange) {
        onPointsChange(INITIAL_POINTS);
      }
    }, 300);
  }, [onPointsChange]);

  // Удаление конкретной точки
  const removePoint = useCallback((pointId) => {
    const updatedPoints = deliveryPoints.filter(point => point.id !== pointId);
    setDeliveryPoints(updatedPoints);

    if (onPointsChange) {
      onPointsChange(updatedPoints);
    }
  }, [deliveryPoints, onPointsChange]);

  // Обработчик клика по маркеру
  const handleMarkerClick = useCallback((point) => {
    setSelectedPoint(point);
    console.log('Выбран маркер:', point);
  }, []);

  return (
      <div className={styles.deliveryMapContainer}>
        {/* Панель управления */}
        <MapControls
            onAddPoint={addPoint}
            onRemoveLast={removeLastPoint}
            onClearAll={clearAllPoints}
            onReset={resetPoints}
            pointsCount={deliveryPoints.length}
            loading={loading}
        />

        {/* Карта */}
        <DeliveryMap
            center={center}
            zoom={zoom}
            warehouse={warehouse}
            deliveryPoints={deliveryPoints}
            onMarkerClick={handleMarkerClick}
        />

        {/* Список точек */}
        <PointsList
            points={deliveryPoints}
            onRemovePoint={removePoint}
        />

        {/* Информация о выбранной точке */}
        {selectedPoint && (
            <div className={styles.selectedInfo}>
              <h4>Выбранная точка:</h4>
              <p>{selectedPoint.title}</p>
              <p>Координаты: {selectedPoint.coords[0].toFixed(6)}, {selectedPoint.coords[1].toFixed(6)}</p>
            </div>
        )}

        {/* Индикатор загрузки */}
        {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
            </div>
        )}
      </div>
  );
};

export default Map;