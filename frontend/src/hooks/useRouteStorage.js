import { useCallback, useState } from 'react';
import {
    getHistory,
    getFavorites,
    saveToHistory,
    removeFromHistory,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
} from '../services/routeStorage';

export function useRouteStorage() {
    const [history, setHistory] = useState(() => getHistory());
    const [favorites, setFavorites] = useState(() => getFavorites());

    const refresh = useCallback(() => {
        setHistory(getHistory());
        setFavorites(getFavorites());
    }, []);

    const addHistory = useCallback((route) => {
        saveToHistory(route);
        refresh();
    }, [refresh]);

    const deleteHistory = useCallback((id) => {
        removeFromHistory(id);
        refresh();
    }, [refresh]);

    const moveToFavorites = useCallback((route) => {
        addToFavorites(route);
        refresh();
    }, [refresh]);

    const deleteFavorite = useCallback((id) => {
        removeFromFavorites(id);
        refresh();
    }, [refresh]);

    const checkFavorite = useCallback((id) => isInFavorites(id), []);

    return {
        history,
        favorites,
        addHistory,
        deleteHistory,
        moveToFavorites,
        deleteFavorite,
        checkFavorite,
        refresh,
    };
}
