import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import layoutStyles from '../layouts/layout.module.scss';
import styles from './settings.module.scss';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import RouteList from './RouteList/RouteList';
import GenerationMenu from './generation/GenerationMenu';
import { useRouteStorage } from '../../hooks/useRouteStorage';
import { useRoute } from '../../context/RouteContext';

const TITLES = {
    menu: null,
    favorites: 'Избранное',
    history: 'История',
    generation: 'Генерация точек',
};

const Settings = () => {
    const [view, setView] = useState('menu');
    const [generationOpen, setGenerationOpen] = useState(false);
    const navigate = useNavigate();
    const { history, favorites, deleteHistory, moveToFavorites, deleteFavorite, refresh } = useRouteStorage();
    const { loadRouteSnapshot } = useRoute();

    const handleMenuSelect = (id) => {
        if (id === 'generation') {
            setView('generation');
            setGenerationOpen(true);
            return;
        }
        setView(id);
    };

    const handleLoadRoute = (route) => {
        loadRouteSnapshot(route);
        navigate('/route');
    };

    const handleBack = () => {
        setView('menu');
        setGenerationOpen(false);
        refresh();
    };

    return (
        <div className={layoutStyles.pagePanel}>
            <div className={`${layoutStyles.pageContent} ${styles.container}`}>
                {view !== 'menu' && (
                    <button type="button" className={styles.backButton} onClick={handleBack}>
                        ← Назад
                    </button>
                )}

                {TITLES[view] && <h2 className={styles.viewTitle}>{TITLES[view]}</h2>}

                {view === 'menu' && <SettingsMenu onSelect={handleMenuSelect} />}

                {view === 'history' && (
                    <RouteList
                        items={history}
                        emptyText="История маршрутов пуста"
                        onDelete={deleteHistory}
                        onFavorite={(route) => {
                            moveToFavorites(route);
                            refresh();
                        }}
                        showFavoriteButton
                        isFavorite={(id) => favorites.some((f) => f.id === id)}
                        onSelect={handleLoadRoute}
                    />
                )}

                {view === 'favorites' && (
                    <RouteList
                        items={favorites}
                        emptyText="Избранных маршрутов пока нет"
                        onDelete={deleteFavorite}
                        onSelect={handleLoadRoute}
                    />
                )}

                {view === 'generation' && generationOpen && <GenerationMenu />}
            </div>
        </div>
    );
};

export default Settings;
