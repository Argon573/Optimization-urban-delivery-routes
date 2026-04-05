import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/layouts/header/Header';
import Panel from './components/layouts/navigatePanel/Panel';
import MapControlRender from './components/point_enter_form/MapControlRender';
import MapRender from "./components/point_enter_form/MapRender";
import Screen404 from "./components/Errors Screens/404 Screen/Screen404";
import styles from './assets/app.module.scss'

const App = () => {
  const [deliveryPoints, setDeliveryPoints] = useState([
    { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
    { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
    { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
  ]);

  return (
      <BrowserRouter>
        <div className={styles.app}>
          <Header />
          <Routes>
            <Route path="/" element={
              <>
                <MapControlRender
                    deliveryPoints={deliveryPoints}
                    setDeliveryPoints={setDeliveryPoints}
                />
                <MapRender deliveryPoints={deliveryPoints} />
                <Panel />
              </>
            } />
            <Route path="/Screen404" element={<Screen404 />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
};

export default App;