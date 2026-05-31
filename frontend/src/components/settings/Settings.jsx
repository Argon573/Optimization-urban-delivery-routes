import GenerationButton from './buttons/GenerationButton';
import styles from './settings.module.scss';
import {Outlet} from "react-router-dom";

const Settings = () => {
    return (
        <div>
            <div className={styles.container}>
                <GenerationButton />
            </div>

            <Outlet />
        </div>
    )
}

export default Settings;