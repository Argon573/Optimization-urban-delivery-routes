
export async function getMap(startPoint, endPoint, points) {
    try {
        const geojson = await fetch('http://10.40.241.48:8000/route/image', {
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
