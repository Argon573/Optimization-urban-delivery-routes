import { LuMapPin } from "react-icons/lu";
import styles from "./panel.module.scss";
import { TbSTurnRight } from "react-icons/tb";
import { FiHexagon } from "react-icons/fi";
import { FiCircle } from "react-icons/fi";
import { Link } from "react-router-dom";



const Panel = () => {
  return (
        <div className={styles.panel}>
          <Link to="/Screen404">
            <button className={styles.mapButton}>
              <LuMapPin className={`${styles.pin} ${styles.icons}`}/>
              <span>Карта</span>
            </button>
          </Link>

          <Link to="route">
            <button className={styles.routeButton}>
              <TbSTurnRight className={`${styles.route} ${styles.icons}`}/>
              <span>Маршрут</span>
            </button>
          </Link>

          <button className={styles.settingsButton}>
            <FiHexagon className={`${styles.hexagon} ${styles.icons}`}/>
            <span>Настройки</span>
          </button>
        </div>
  )
}

export default Panel;

//TODO починить иконку
//<FiCircle className={`${styles.circle} ${styles.icons}`}/>