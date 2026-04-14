import Ymap from './Ymap';

const Map = () => {
    const points = [
        { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
        { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
        { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
    ];

    return (
        <Ymap points={points} />
    )
}

export default Map;