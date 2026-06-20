import { API_BASE } from '../api/config';

const WEAK_CONNECTION_TYPES = new Set(['2g', 'slow-2g', 'edge', '3g']);

export function isWeakConnectionType(effectiveType) {
    if (!effectiveType) {
        return false;
    }
    return WEAK_CONNECTION_TYPES.has(String(effectiveType).toLowerCase());
}

export function evaluateNetworkQuality({ downlinkMbps, pingMs, effectiveType, isOnline }) {
    if (isOnline === false) {
        return 'weak';
    }

    const speedStable = downlinkMbps != null && downlinkMbps > 20;
    const pingStable = pingMs != null && pingMs < 500;
    const typeStable = effectiveType != null && !isWeakConnectionType(effectiveType);

    return speedStable || pingStable || typeStable ? 'stable' : 'weak';
}

export { WEAK_CONNECTION_TYPES };
