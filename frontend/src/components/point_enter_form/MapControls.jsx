// components/deliveryMap/MapControls.jsx
import React from 'react';
import styles from './mapControl.module.scss'

const MapControls = ({ onAddPoint, onRemoveLast, onClearAll, onReset, pointsCount, loading }) => {
  return (
      <div className={styles.controls}>
        <button onClick={onAddPoint} disabled={loading} className={styles.button}>
          ➕ Добавить точку
        </button>
        <button onClick={onRemoveLast} disabled={pointsCount === 0 || loading} className={styles.button}>
          ➖ Удалить последнюю
        </button>
        <button onClick={onClearAll} disabled={pointsCount === 0 || loading} className={styles.button}>
          🗑️ Очистить все
        </button>
        <button onClick={onReset} disabled={loading} className={styles.button}>
          🔄 Сбросить
        </button>
      </div>
  );
};

export default MapControls;