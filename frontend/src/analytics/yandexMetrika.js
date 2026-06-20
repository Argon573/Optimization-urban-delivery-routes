export const YANDEX_METRIKA_ID = 110016885;

let initialized = false;

function getPageUrl(path = window.location.pathname + window.location.search) {
    return path.startsWith('http') ? path : `${window.location.origin}${path}`;
}

export function initYandexMetrika() {
    if (initialized || typeof window.ym !== 'function') {
        return;
    }

    window.ym(YANDEX_METRIKA_ID, 'init', {
        defer: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: import.meta.env.PROD,
    });

    initialized = true;
}

export function hitYandexMetrika(path) {
    if (typeof window.ym !== 'function') {
        return;
    }

    window.ym(YANDEX_METRIKA_ID, 'hit', getPageUrl(path), {
        title: document.title,
    });
}

export function scheduleYandexMetrikaInit() {
    const run = () => requestAnimationFrame(() => initYandexMetrika());

    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run, { once: true });
    }
}
