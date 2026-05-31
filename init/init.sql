-- Создание таблицы для событий
CREATE TABLE IF NOT EXISTS road_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    title VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    severity INTEGER,
    distance_m FLOAT,
    source VARCHAR(50),
    detected_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_events_expires ON road_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_events_coords ON road_events(latitude, longitude);