import styles from './RouteMapLoadingOverlay.module.scss';

const RouteMapLoadingOverlay = ({ label = 'Обновляем маршрут…' }) => (
    <div className={styles.overlay} aria-live="polite" aria-busy="true">
        <div className={styles.card}>
            <div className={styles.spinner} />
            <span className={styles.label}>{label}</span>
        </div>
    </div>
);

export default RouteMapLoadingOverlay;
