import { LuMapPin } from "react-icons/lu";
import styles from "./panel.module.scss";
import { TbSTurnRight } from "react-icons/tb";
import { FiSettings } from "react-icons/fi";
import { NavLink } from "react-router-dom";


const Panel = () => {
  return (
        <div className={styles.panel}>
          <NavLink to="/" className={({ isActive }) => `${isActive ? styles.active : ''}`} >
            <button className={`${styles.mapButton} ${styles.button}`}>
              <LuMapPin className={`${styles.icons}`}/>
              <span>Карта</span>
            </button>
          </NavLink>

          <NavLink to="route" className={({ isActive }) => `${isActive ? styles.active : ''}`}>
            <button className={`${styles.button}`}>
              <TbSTurnRight className={`${styles.icons}`}/>
              <span>Маршрут</span>
            </button>
          </NavLink>

          <NavLink to="settings" className={({ isActive }) => `${isActive ? styles.active : ''}`}>
            <button className={`${styles.settingsButton} ${styles.button}`}>
              <FiSettings className={styles.icons}/>
              <span>Настройки</span>
            </button>
          </NavLink>
        </div>
  )
}

export default Panel;
