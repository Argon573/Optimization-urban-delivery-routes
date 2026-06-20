import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../../../context/RouteContext';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import styles from './RouteActions.module.scss';

const RouteActions = () => {
    const {
        points,
        buildRoute,
        resetAll,
        isBuilding,
        isAutoRouteEnabled,
        isWeakNetwork,
        isNetworkChecking,
        buildError,
    } = useRoute();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const [error, setError] = useState('');

    const handleBuild = async () => {
        if (points.length < 2) {
            setError('Добавьте минимум 2 точки маршрута');
            return;
        }

        setError('');

        try {
            await buildRoute();

            if (!isDesktop) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Не удалось построить маршрут');
        }
    };

    const handleReset = () => {
        setError('');
        resetAll();
    };

    const displayError = error || buildError;

    return (
        <div className={styles.actions}>
            {!isAutoRouteEnabled && (
                <button
                    type="button"
                    className={styles.buildButton}
                    onClick={handleBuild}
                    disabled={isBuilding || isNetworkChecking}
                >
                    Построить маршрут
                </button>
            )}
            {isWeakNetwork && !isNetworkChecking && (
                <p className={styles.networkHint}>
                    Медленное соединение — маршрут обновится после нажатия «Построить маршрут».
                </p>
            )}
            <button type="button" className={styles.resetButton} onClick={handleReset}>
                Сбросить
            </button>
            {displayError && <p className={styles.error}>{displayError}</p>}
        </div>
    );
};

export default RouteActions;
