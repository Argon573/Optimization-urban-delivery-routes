import { IoClose } from 'react-icons/io5';
import styles from './WaypointList.module.scss';

const WaypointList = ({ points, removePoint }) => (
    <ul className={styles.list}>
        {points.map((point, index) => (
            <li key={point.id} className={styles.pointSection}>
                <span className={styles.marker}>
                    <span>{index + 1}</span>
                </span>
                <span className={styles.address}>{point.address}</span>
                <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removePoint(point.id)}
                    aria-label="Удалить точку"
                >
                    <IoClose />
                </button>
            </li>
        ))}
    </ul>
);

export default WaypointList;
