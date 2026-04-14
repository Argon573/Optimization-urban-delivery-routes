import Ymap from './Ymap';
import { usePoints } from '../RouteScreen/PointsContext';
const Map = () => {
/*
    const points = [
        { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1' },
        { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2' },
        { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3' }
    ];
*/
    const { points, removePoint } = usePoints();

    const pointsList = points.map((point, index) => ({id: index, coords: [point.longitude, point.latitude], title: ''}));

    console.log(pointsList);
    return (
        <Ymap points={pointsList} />
    )
}

export default Map;