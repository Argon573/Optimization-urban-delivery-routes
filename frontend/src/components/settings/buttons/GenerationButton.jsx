import { NavLink } from "react-router-dom";
import styles from './buttons.module.scss'

const GenerationButton = ({}) => {
    return (
        <NavLink to='/settings/generation'>
            <button className={styles.generationButton}>Generation</button>
        </NavLink>
    )
}

export default GenerationButton;