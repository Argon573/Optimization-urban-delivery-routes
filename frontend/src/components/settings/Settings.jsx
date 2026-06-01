import { useState } from 'react';
import GenerationButton from './buttons/GenerationButton';
import GenerationMenu from './generation/GenerationMenu';
import layoutStyles from '../layouts/layout.module.scss';
import styles from './settings.module.scss';

const Settings = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={layoutStyles.pagePanel}>
            <div className={`${layoutStyles.pageContent} ${styles.container}`}>
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