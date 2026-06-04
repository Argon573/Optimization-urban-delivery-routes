/**
 * Базовый URL API. По умолчанию пустая строка — запросы на тот же origin (HTTPS),
 * nginx проксирует /route, /geocode, /generate на бэкенд :8000.
 * Для локальной разработки без прокси: VITE_API_BASE_URL=http://localhost:8000
 */
const raw = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_BASE = raw.replace(/\/$/, '');
