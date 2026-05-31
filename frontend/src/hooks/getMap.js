
export async function getMap(startPoint, endPoint, points, transportProfile = 'car') {
    try {
        const params = new URLSearchParams({ profile: transportProfile });
        const geojson = await fetch(`http://localhost:8000/route/image?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_point: startPoint ? startPoint : null,
                ...(endPoint && { end_point: endPoint }),
                points: points
            })
        });

        return geojson.json();
    }
    catch (error) {
        console.error(error);
    }
}
