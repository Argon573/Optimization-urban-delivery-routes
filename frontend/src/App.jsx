import React from 'react';
import { RouteProvider } from './context/RouteContext';
import { AppRouter } from './router/AppRouter';
import AppShell from './components/AppShell';
import styles from './assets/app.module.scss';

const App = () => (
    <RouteProvider>
        <AppShell>
            <div className={styles.app}>
                <AppRouter />
            </div>
        </AppShell>
    </RouteProvider>
);

export default App;
