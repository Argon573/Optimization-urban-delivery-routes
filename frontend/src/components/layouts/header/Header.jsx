import { PiMotorcycleFill } from "react-icons/pi";
import styles from "./header.module.scss";
import { Link } from "react-router-dom";

const Header = () => {
  return (
      <header>
        <Link to="/">
          <PiMotorcycleFill className={styles.logo}/>
        </Link>
        <p1 className={styles.p1}>Logo</p1>
      </header>
  )
}

export default Header;