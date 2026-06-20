const WEAK_CONNECTION_TYPES = new Set(['2g', 'slow-2g', 'edge', '3g']);

export function isWeakConnectionType(effectiveType) {
    if (!effectiveType) {
        return false;
    }
    return WEAK_CONNECTION_TYPES.has(String(effectiveType).toLowerCase());
}

function formatPing(pingMs) {
    if (pingMs == null) {
        return '—';
    }
    if (!Number.isFinite(pingMs)) {
        return 'timeout';
    }
    return `${Math.round(pingMs)} ms`;
}

function formatSpeed(downlinkMbps) {
    if (downlinkMbps == null) {
        return '—';
    }
    return `${downlinkMbps} Mbps`;
}

export function logNetworkQuality({
    downlinkMbps,
    pingMs,
    effectiveType,
    isOnline,
    quality,
    speedStable,
    pingStable,
    typeStable,
}) {
    console.groupCollapsed(`📶 Сеть: ${quality === 'stable' ? 'стабильная' : 'слабая'}`);
    console.table({
        'Скорость (downlink)': {
            Значение: formatSpeed(downlinkMbps),
            Критерий: '> 2 Mbps',
            'Стабильно': speedStable ? 'да' : 'нет',
        },
        'Ping (/health)': {
            Значение: formatPing(pingMs),
            Критерий: '< 500 ms',
            'Стабильно': pingStable ? 'да' : 'нет',
        },
        'Тип соединения': {
            Значение: effectiveType ?? '—',
            Критерий: 'не 2G / EDGE / 3G',
            'Стабильно': typeStable ? 'да' : 'нет',
        },
        'Онлайн': {
            Значение: isOnline ? 'да' : 'нет',
            Критерий: 'online',
            'Стабильно': isOnline ? 'да' : 'нет',
        },
    });
    console.log(
        'Итог:',
        quality === 'stable'
            ? 'Scenario 1 — авто-построение (все критерии выполнены)'
            : 'Scenario 2 — кнопка «Построить маршрут» (хотя бы один критерий не выполнен)',
    );
    console.groupEnd();
}

export function evaluateNetworkQuality({ downlinkMbps, pingMs, effectiveType, isOnline }) {
    const speedStable = downlinkMbps != null && downlinkMbps > 2;
    const pingStable = pingMs != null && pingMs < 500;
    const typeStable = effectiveType != null && !isWeakConnectionType(effectiveType);

    if (isOnline === false) {
        logNetworkQuality({
            downlinkMbps,
            pingMs,
            effectiveType,
            isOnline: false,
            quality: 'weak',
            speedStable: false,
            pingStable: false,
            typeStable: false,
        });
        return 'weak';
    }

    const quality = speedStable && pingStable && typeStable ? 'stable' : 'weak';

    logNetworkQuality({
        downlinkMbps,
        pingMs,
        effectiveType,
        isOnline: true,
        quality,
        speedStable,
        pingStable,
        typeStable,
    });

    return quality;
}

export { WEAK_CONNECTION_TYPES };
