import { useState } from 'react';
import GenerationButton from './buttons/GenerationButton';
import GenerationMenu from './generation/GenerationMenu';
import styles from './settings.module.scss';

const Settings = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <GenerationButton
                    isOpen={menuOpen}
                    onClick={() => setMenuOpen((prev) => !prev)}
                />
                {menuOpen && <GenerationMenu />}
            </div>
        </div>
    );
};

export default Settings;