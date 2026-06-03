import { LuMapPin } from 'react-icons/lu';
import styles from './panel.module.scss';
import { TbSTurnRight } from 'react-icons/tb';
import { FiSettings } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const Panel = ({ variant = 'mobile' }) => {
    if (variant === 'desktop') {
        return (
            <nav className={styles.panelDesktop} aria-label="Навигация">
                <NavLink
                    to="/route"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <TbSTurnRight className={styles.icons} />
                    <span>Маршрут</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <FiSettings className={styles.icons} />
                    <span>Настройки</span>
                </NavLink>
            </nav>
        );
    }

    return (
        <nav className={styles.panelMobile} aria-label="Навигация">
            <NavLink
                to="/"
                end
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <LuMapPin className={styles.icons} />
                <span>Карта</span>
            </NavLink>

            <NavLink
                to="/route"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <TbSTurnRight className={styles.icons} />
                <span>Маршрут</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <FiSettings className={styles.icons} />
                <span>Настройки</span>
            </NavLink>
        </nav>
    );
};

export default Panel;
