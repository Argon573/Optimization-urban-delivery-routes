import { LuMapPin } from 'react-icons/lu';
import { TbSTurnRight } from 'react-icons/tb';
import { FiSettings } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import styles from './NavigationBar.module.scss';

const NavigationBar = ({ variant = 'mobile' }) => {
    if (variant === 'desktop') {
        return (
            <nav className={styles.panelDesktop} aria-label="Навигация">
                <NavLink
                    to="/route"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <span className={styles.iconWrap} aria-hidden>
                        <TbSTurnRight className={styles.icons} />
                    </span>
                    <span>Маршрут</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <span className={styles.iconWrap} aria-hidden>
                        <FiSettings className={styles.icons} />
                    </span>
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
                <span className={styles.iconWrap} aria-hidden>
                    <LuMapPin className={styles.icons} />
                </span>
                <span>Карта</span>
            </NavLink>

            <NavLink
                to="/route"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.iconWrap} aria-hidden>
                    <TbSTurnRight className={styles.icons} />
                </span>
                <span>Маршрут</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.iconWrap} aria-hidden>
                    <FiSettings className={styles.icons} />
                </span>
                <span>Настройки</span>
            </NavLink>
        </nav>
    );
};

export default NavigationBar;
