// App.jsx
import React, { useState } from 'react';
import Header from './components/layouts/header/Header';
import Panel from './components/layouts/navigatePanel/Panel';
import MapControlRender from './components/point_enter_form/MapControlRender';
import MapRender from "./components/point_enter_form/MapRender";
import styles from './assets/app.module.scss'

const App = () => {

  const [deliveryPoints, setDeliveryPoints] = useState([
    { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
    { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
    { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
  ]);

  return (
      <div className={styles.app}>
        <Header />
        <MapControlRender
          deliveryPoints={deliveryPoints}
          setDeliveryPoints={setDeliveryPoints}
        />
        <MapRender
          deliveryPoints={deliveryPoints}
        />
        <Panel />
      </div>
  );
};

export default App;