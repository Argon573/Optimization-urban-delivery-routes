export const getUserGeolocation = () => new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
        reject(new Error('Геолокация не поддерживается'));
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            if (latitude == null || longitude == null) {
                reject(new Error('Нет координат'));
                return;
            }

            resolve([latitude, longitude]);
        },
        (error) => reject(error),
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        },
    );
});
