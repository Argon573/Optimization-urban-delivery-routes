import { useCallback, useEffect, useRef, useState } from 'react';
import { measurePing } from '../utils/measurePing';
import { evaluateNetworkQuality } from '../utils/networkQuality';

const RECHECK_INTERVAL_MS = 30_000;

function readConnectionMetrics() {
    const connection = navigator.connection
        ?? navigator.mozConnection
        ?? navigator.webkitConnection;

    return {
        downlinkMbps: connection?.downlink ?? null,
        effectiveType: connection?.effectiveType ?? null,
    };
}

export function useNetworkQuality() {
    const [quality, setQuality] = useState('stable');
    const [isChecking, setIsChecking] = useState(true);
    const [metrics, setMetrics] = useState({
        downlinkMbps: null,
        pingMs: null,
        effectiveType: null,
    });
    const checkIdRef = useRef(0);

    const runCheck = useCallback(async () => {
        const checkId = checkIdRef.current + 1;
        checkIdRef.current = checkId;
        setIsChecking(true);

        const { downlinkMbps, effectiveType } = readConnectionMetrics();
        const pingMs = navigator.onLine ? await measurePing() : Number.POSITIVE_INFINITY;

        if (checkIdRef.current !== checkId) {
            return;
        }

        const nextQuality = evaluateNetworkQuality({
            downlinkMbps,
            pingMs,
            effectiveType,
            isOnline: navigator.onLine,
        });

        setMetrics({ downlinkMbps, pingMs, effectiveType });
        setQuality(nextQuality);
        setIsChecking(false);
    }, []);

    useEffect(() => {
        runCheck();

        const connection = navigator.connection
            ?? navigator.mozConnection
            ?? navigator.webkitConnection;

        const handleChange = () => {
            runCheck();
        };

        window.addEventListener('online', handleChange);
        window.addEventListener('offline', handleChange);
        connection?.addEventListener?.('change', handleChange);

        const interval = setInterval(runCheck, RECHECK_INTERVAL_MS);

        return () => {
            checkIdRef.current += 1;
            window.removeEventListener('online', handleChange);
            window.removeEventListener('offline', handleChange);
            connection?.removeEventListener?.('change', handleChange);
            clearInterval(interval);
        };
    }, [runCheck]);

    return {
        quality,
        isStable: quality === 'stable',
        isWeak: quality === 'weak',
        isChecking,
        metrics,
        recheck: runCheck,
    };
}
