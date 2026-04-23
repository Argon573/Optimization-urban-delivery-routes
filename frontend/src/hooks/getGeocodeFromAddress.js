

export async function getGeocodeFromAddress (address) {
    try {
        const geocode = await fetch('http://localhost:8000/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: "Екатеринбург",
                street: address.street,
                house: address.house
            })
        });


        if (!geocode.ok) {
            return null;
        }

        return geocode.json();
    }
    catch (error) {
        return null;
    }
}