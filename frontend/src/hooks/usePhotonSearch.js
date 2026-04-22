import { useState, useEffect } from "react";

export const usePhotonSearch = (query) => {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!query || query.length < 3) {
                setSuggestions([]);
                return;
            }

            fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' Екатеринбург')}&limit=5`
            )
                .then(res => {
                    if (!res.ok) throw new Error("Ошибка запроса");
                    return res.json();
                })
                .then(data => {
                    if (!data.features) {
                        setSuggestions([]);
                        return;
                    }

                    const results = data.features.map(f => ({
                        name: f.properties.name,
                        street: f.properties.street,
                        city: f.properties.city,
                        lat: f.geometry.coordinates[1],
                        lon: f.geometry.coordinates[0]
                    }));

                    setSuggestions(results);
                })
                .catch(err => {
                    console.error(err);
                    setSuggestions([]);
                });
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    return suggestions;
};