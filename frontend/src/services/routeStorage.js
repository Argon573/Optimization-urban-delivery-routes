const HISTORY_KEY = 'route_history';
const FAVORITES_KEY = 'route_favorites';

function readList(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

export function getHistory() {
    return readList(HISTORY_KEY);
}

export function getFavorites() {
    return readList(FAVORITES_KEY);
}

export function saveToHistory(route) {
    const list = getHistory();
    const entry = {
        ...route,
        id: route.id ?? `h_${Date.now()}`,
        createdAt: route.createdAt ?? Date.now(),
    };
    writeList(HISTORY_KEY, [entry, ...list.filter((r) => r.id !== entry.id)].slice(0, 50));
    return entry;
}

export function removeFromHistory(id) {
    writeList(HISTORY_KEY, getHistory().filter((r) => r.id !== id));
}

export function addToFavorites(route) {
    const list = getFavorites();
    const entry = {
        ...route,
        id: route.id ?? `f_${Date.now()}`,
        createdAt: route.createdAt ?? Date.now(),
        favoritedAt: Date.now(),
    };
    if (list.some((r) => r.id === entry.id)) {
        return entry;
    }
    writeList(FAVORITES_KEY, [entry, ...list].slice(0, 50));
    return entry;
}

export function removeFromFavorites(id) {
    writeList(FAVORITES_KEY, getFavorites().filter((r) => r.id !== id));
}

export function isInFavorites(id) {
    return getFavorites().some((r) => r.id === id);
}

export function formatRouteLabel(route) {
    const date = new Date(route.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const count = route.points?.length ?? 0;
    return `Маршрут · ${count} точек · ${date}`;
}
