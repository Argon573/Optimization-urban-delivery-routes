import React from 'react';
import { PointsProvider } from './components/RouteScreen/PointsContext';
import { AppRouter } from './router/AppRouter';
import AppShell from './components/AppShell';
import styles from './assets/app.module.scss';

const App = () => {
  return (
      <PointsProvider>
        <AppShell>
          <div className={styles.app}>
            <AppRouter />
          </div>
        </AppShell>
      </PointsProvider>
  );
};

export default App;