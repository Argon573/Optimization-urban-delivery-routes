import React from 'react';
import DeliveryMap from './components/DeliveryMap';
import styles from './assets/app.module.scss';
import Form from "./components/point_enter_form/Form";

const App = () => {
  return (
      <div className={styles.app}>
        <Form />
        <DeliveryMap
            center={[37.618423, 55.751244]}
            zoom={12}
            className={styles.deliveryMap}
        />
      </div>
  );
}

export default App;