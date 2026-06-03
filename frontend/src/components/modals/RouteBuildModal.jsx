import AppLogo from '../common/AppLogo';
import styles from './RouteBuildModal.module.scss';

const RouteBuildModal = ({ progress }) => (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="build-title">
        <div className={styles.modal}>
            <AppLogo width={56} height={42} className={styles.logo} />
            <h2 id="build-title" className={styles.title}>Построение маршрута</h2>
            <p className={styles.description}>
                Подбираем оптимальный маршрут. Это может занять некоторое время.
            </p>
            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                    <span className={styles.progressLabel}>{progress}%</span>
                </div>
            </div>
        </div>
    </div>
);

export default RouteBuildModal;
