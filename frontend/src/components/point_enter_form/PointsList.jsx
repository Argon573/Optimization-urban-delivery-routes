// components/deliveryMap/PointsList.jsx
import React from 'react';
import styles from './deliveryMap.module.scss';

const PointsList = ({ points, onRemovePoint }) => {
  if (points.length === 0) {
    return (
        <div className={styles.emptyList}>
          <p>Нет точек доставки</p>
        </div>
    );
  }

  return (
      <div className={styles.pointsList}>
        <h3>Точки доставки ({points.length})</h3>
        <ul>
          {points.map(point => (
              <li key={point.id} className={styles.pointItem}>
                <span className={styles.pointTitle}>{point.title}</span>
                <span className={styles.pointCoords}>
              {point.coords[0].toFixed(4)}, {point.coords[1].toFixed(4)}
            </span>
                <button
                    onClick={() => onRemovePoint(point.id)}
                    className={styles.removeButton}
                >
                  ✕
                </button>
              </li>
          ))}
        </ul>
      </div>
  );
};

export default PointsList;