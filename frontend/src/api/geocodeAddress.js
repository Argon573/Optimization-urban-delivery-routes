export async function geocodeAddress(address) {
    try {
        const response = await fetch('http://localhost:8000/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: 'Екатеринбург',
                street: address.street,
                house: address.house,
            }),
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch {
        return null;
    }
}
