import { PiMotorcycleFill } from "react-icons/pi";
import styles from "./header.module.scss";

const Header = () => {
  return (
      <header>
        <PiMotorcycleFill className={styles.logo}/>
        <p1 className={styles.p1}>Logo</p1>
      </header>
  )
}

export default Header;