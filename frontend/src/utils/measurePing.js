import { API_BASE } from '../api/config';

export async function measurePing(timeoutMs = 5000) {
    const target = `${API_BASE}/health`;
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        await fetch(target, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
        });
        return performance.now() - start;
    } catch {
        return Number.POSITIVE_INFINITY;
    } finally {
        clearTimeout(timer);
    }
}
