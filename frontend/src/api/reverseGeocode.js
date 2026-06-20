function formatPhotonAddress(properties, latitude, longitude) {
    const streetParts = [properties.street, properties.housenumber].filter(Boolean);
    const streetLine = streetParts.join(' ') || properties.name || '';

    if (streetLine) {
        const city = properties.city || properties.locality || 'Екатеринбург';
        return `${streetLine}, ${city}`;
    }

    return `Точка на карте (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
}

export async function reverseGeocode(latitude, longitude) {
    const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&lang=ru`,
    );

    if (!response.ok) {
        throw new Error('Reverse geocode failed');
    }

    const data = await response.json();
    const feature = data.features?.[0];

    if (!feature?.properties) {
        return `Точка на карте (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    }

    return formatPhotonAddress(feature.properties, latitude, longitude);
}
