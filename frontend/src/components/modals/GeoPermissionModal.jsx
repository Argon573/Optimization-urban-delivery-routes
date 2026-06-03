import AppLogo from '../common/AppLogo';
import styles from './GeoPermissionModal.module.scss';

const GeoPermissionModal = ({ onAllow, onLater }) => (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="geo-title">
        <div className={styles.modal}>
            <AppLogo width={56} height={42} className={styles.logo} />
            <h2 id="geo-title" className={styles.title}>Доступ к геолокации</h2>
            <p className={styles.description}>
                Чтобы строить маршруты и показывать ваше местоположение, нужно разрешение
                на доступ к геолокации.
            </p>
            <button type="button" className={styles.allowButton} onClick={onAllow}>
                Разрешить
            </button>
            <button type="button" className={styles.laterButton} onClick={onLater}>
                Позже
            </button>
        </div>
    </div>
);

export default GeoPermissionModal;
