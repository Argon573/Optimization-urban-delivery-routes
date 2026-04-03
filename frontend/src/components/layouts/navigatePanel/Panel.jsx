import { LuMapPin } from "react-icons/lu";
import styles from "./panel.module.scss";
import { TbSTurnRight } from "react-icons/tb";
import { FiHexagon } from "react-icons/fi";
import { FiCircle } from "react-icons/fi";

const Panel = () => {
  return (
      <div className={styles.panel}>
        <button className={styles.mapButton}>
          <LuMapPin className={`${styles.pin} ${styles.icons}`}/>
        </button>

        <button className={styles.routeButton}>
          <TbSTurnRight className={`${styles.route} ${styles.icons}`}/>
        </button>

        <button className={styles.settingsButton}>
          <FiHexagon className={`${styles.hexagon} ${styles.icons}`}/>
          <FiCircle className={`${styles.circle} ${styles.icons}`}/>
        </button>
      </div>
  )
}

export default Panel;