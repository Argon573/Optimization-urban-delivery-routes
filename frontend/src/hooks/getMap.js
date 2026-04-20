
export async function getMap(point) {
    try {
        const geojson = await fetch('http://31.31.196.104:8000/route/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ points: point })
        });

        return geojson.json();
    }
    catch (error) {
        console.error(error);
    }
}
