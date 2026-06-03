import { IoTrashOutline, IoStar, IoStarOutline } from 'react-icons/io5';
import { formatRouteLabel } from '../../../services/routeStorage';
import styles from './RouteList.module.scss';

const RouteList = ({
    items,
    emptyText,
    onDelete,
    onFavorite,
    showFavoriteButton = false,
    isFavorite = () => false,
    onSelect,
}) => {
    if (items.length === 0) {
        return <p className={styles.empty}>{emptyText}</p>;
    }

    return (
        <ul className={styles.list}>
            {items.map((route) => (
                <li key={route.id} className={styles.item}>
                    <button
                        type="button"
                        className={styles.itemMain}
                        onClick={() => onSelect?.(route)}
                    >
                        <span className={styles.label}>
                            {route.label || formatRouteLabel(route)}
                        </span>
                    </button>
                    <div className={styles.actions}>
                        {showFavoriteButton && (
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => onFavorite(route)}
                                aria-label="В избранное"
                            >
                                {isFavorite(route.id) ? (
                                    <IoStar className={styles.starActive} />
                                ) : (
                                    <IoStarOutline />
                                )}
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => onDelete(route.id)}
                            aria-label="Удалить"
                        >
                            <IoTrashOutline />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default RouteList;
