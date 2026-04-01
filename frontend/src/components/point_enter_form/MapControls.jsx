// components/deliveryMap/MapControls.jsx
import React from 'react';

const MapControls = ({ onAddPoint, onRemoveLast, onClearAll, onReset, pointsCount, loading }) => {
  const styles = {
    controls: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 10,
      display: 'flex',
      gap: '10px',
      background: 'white',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    button: {
      padding: '8px 16px',
      background: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  return (
      <div style={styles.controls}>
        <button onClick={onAddPoint} disabled={loading} style={styles.button}>
          ➕ Добавить точку
        </button>
        <button onClick={onRemoveLast} disabled={pointsCount === 0 || loading} style={styles.button}>
          ➖ Удалить последнюю
        </button>
        <button onClick={onClearAll} disabled={pointsCount === 0 || loading} style={styles.button}>
          🗑️ Очистить все
        </button>
        <button onClick={onReset} disabled={loading} style={styles.button}>
          🔄 Сбросить
        </button>
      </div>
  );
};

export default MapControls;