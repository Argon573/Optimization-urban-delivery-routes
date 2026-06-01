import { useState, useEffect } from 'react';

export const usePhotonSearch = (query, enabled = true) => {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (!enabled) {
            setSuggestions([]);
            return undefined;
        }

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            const trimmed = query?.trim() ?? '';

            if (trimmed.length < 3) {
                setSuggestions([]);
                return;
            }

            fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed + ' Екатеринбург')}&limit=5`,
                { signal: controller.signal },
            )
                .then((res) => {
                    if (!res.ok) throw new Error('Ошибка запроса');
                    return res.json();
                })
                .then((data) => {
                    if (!data.features) {
                        setSuggestions([]);
                        return;
                    }

                    const results = data.features.map((f) => ({
                        name: f.properties.name,
                        street: f.properties.street,
                        city: f.properties.city,
                        lat: f.geometry.coordinates[1],
                        lon: f.geometry.coordinates[0],
                    }));

                    setSuggestions(results);
                })
                .catch((err) => {
                    if (err.name === 'AbortError') return;
                    console.error(err);
                    setSuggestions([]);
                });
        }, 400);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query, enabled]);

    return suggestions;
};
