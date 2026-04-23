

export async function getGeocodeFromAddress (address) {
    try {
        const geocode = await fetch('http://10.40.241.48:8000/route/image', {
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

        return geocode.json();
    }
    catch (error) {
        return null;
    }
}