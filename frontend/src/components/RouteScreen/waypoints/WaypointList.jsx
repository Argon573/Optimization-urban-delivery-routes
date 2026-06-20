import { IoEllipsisHorizontal } from 'react-icons/io5';
import { useRoute } from '../../../context/RouteContext';
import { getPriorityColor, POINT_PRIORITIES } from '../../../constants/pointPriority';
import { getPointDisplayName } from '../../../utils/pointName';
import styles from './WaypointList.module.scss';

const WaypointList = ({ points }) => {
    const { openPointSettings } = useRoute();

    return (
    <ul className={styles.list}>
        {points.map((point, index) => {
            const priority = point.priority ?? POINT_PRIORITIES.NORMAL;
            const color = getPriorityColor(priority);

            return (
                <li
                    key={point.id}
                    className={styles.pointSection}
                    style={{ '--priority-color': color }}
                >
                    <span className={styles.priorityBar} aria-hidden />
                    <span className={styles.marker} style={{ backgroundColor: color, boxShadow: `1px 1px 8px 0 ${color}` }}>
                        <span>{index + 1}</span>
                    </span>
                    <span className={styles.address}>{getPointDisplayName(point)}</span>
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => openPointSettings(point.id)}
                        aria-label="Настройки точки"
                    >
                        <IoEllipsisHorizontal />
                    </button>
                </li>
            );
        })}
    </ul>
    );
};

export default WaypointList;
