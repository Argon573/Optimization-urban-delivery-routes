import { IoChevronForward } from 'react-icons/io5';
import styles from './SettingsMenu.module.scss';

const MENU_ITEMS = [
    { id: 'favorites', label: 'Избранное' },
    { id: 'history', label: 'История' },
    { id: 'generation', label: 'Генерация точек' },
];

const SettingsMenu = ({ onSelect }) => (
    <ul className={styles.menu}>
        {MENU_ITEMS.map((item) => (
            <li key={item.id}>
                <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => onSelect(item.id)}
                >
                    <span>{item.label}</span>
                    <IoChevronForward className={styles.chevron} />
                </button>
            </li>
        ))}
    </ul>
);

export default SettingsMenu;
