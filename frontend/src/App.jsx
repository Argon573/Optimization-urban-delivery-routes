import React from 'react';
import { PointsProvider } from './components/RouteScreen/PointsContext';
import { AppRouter } from './router/AppRouter';
import styles from './assets/app.module.scss';

const App = () => {
  return (
      <PointsProvider>
        <div className={styles.app}>
          <AppRouter />
        </div>
      </PointsProvider>
  );
};

export default App;