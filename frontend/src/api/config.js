import { SITE_URL } from '../constants/site';

/**
 * Базовый URL API.
 * Production (на optimization-urban.ru): пустая строка → запросы на тот же origin (/route, /geocode, …).
 * Development: пустая строка → Vite proxy на localhost:8000.
 * Переопределение: VITE_API_BASE_URL в .env
 */
const raw = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_BASE = raw.replace(/\/$/, '');

export { SITE_URL };
