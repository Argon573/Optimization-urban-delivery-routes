import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoints } from '../PointsContext';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import styles from './RouteActions.module.scss';

const RouteActions = () => {
    const { points, requestRouteBuild, resetAll } = usePoints();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const [error, setError] = useState('');

    const handleBuild = () => {
        if (points.length < 2) {
            setError('Добавьте минимум 2 точки маршрута');
            return;
        }

        setError('');
        requestRouteBuild();

        if (!isDesktop) {
            navigate('/');
        }
    };

    const handleReset = () => {
        setError('');
        resetAll();
    };

    return (
        <div className={styles.actions}>
            <button type="button" className={styles.buildButton} onClick={handleBuild}>
                построить
            </button>
            <button type="button" className={styles.resetButton} onClick={handleReset}>
                Сбросить
            </button>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default RouteActions;
