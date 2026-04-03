// App.jsx
import React, { useState } from 'react';
import DeliveryMap from './components/point_enter_form/DeliveryMap';
import MapControls from './components/point_enter_form/MapControls';
import Header from './components/layouts/header/Header';
import Panel from './components/layouts/navigatePanel/Panel';
import styles from './assets/index.module.scss';

const App = () => {
  const [deliveryPoints, setDeliveryPoints] = useState([
    { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
    { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
    { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
  ]);
  const [loading, setLoading] = useState(false);

  const addPoint = () => {
    setLoading(true);
    setTimeout(() => {
      const newPoint = {
        id: Date.now(),
        coords: [
          37.618423 + (Math.random() - 0.5) * 0.1,
          55.751244 + (Math.random() - 0.5) * 0.1
        ],
        title: `Новый магазин ${deliveryPoints.length + 1}`
      };
      setDeliveryPoints([...deliveryPoints, newPoint]);
      setLoading(false);
    }, 300);
  };

  const removeLastPoint = () => {
    if (deliveryPoints.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setDeliveryPoints(deliveryPoints.slice(0, -1));
      setLoading(false);
    }, 300);
  };

  const clearAllPoints = () => {
    setLoading(true);
    setTimeout(() => {
      setDeliveryPoints([]);
      setLoading(false);
    }, 300);
  };

  const resetPoints = () => {
    setLoading(true);
    setTimeout(() => {
      setDeliveryPoints([
        { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
        { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
        { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
      ]);
      setLoading(false);
    }, 300);
  };

  return (
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <Header />
        <MapControls
            className={styles.mapWrapper}
            onAddPoint={addPoint}
            onRemoveLast={removeLastPoint}
            onClearAll={clearAllPoints}
            onReset={resetPoints}
            pointsCount={deliveryPoints.length}
            loading={loading}
        />
        <DeliveryMap
            center={[37.618423, 55.751244]}
            zoom={12}
            warehouse={[37.618423, 55.751244]}
            deliveryPoints={deliveryPoints}
        />
        <Panel />
      </div>
  );
};

export default App;