import { ROUTE_POINTS_MIN, ROUTE_POINTS_MAX, GENERATION_RADIUS_MIN, GENERATION_RADIUS_MAX } from '../../../constants/routeLimits';

export const RADIUS_MIN = GENERATION_RADIUS_MIN;
export const RADIUS_MAX = GENERATION_RADIUS_MAX;
export const POINTS_MIN = ROUTE_POINTS_MIN;
export const POINTS_MAX = ROUTE_POINTS_MAX;

export function validateGenerationForm(radiusRaw, pointsCountRaw) {
    const errors = {};

    const radiusStr = String(radiusRaw ?? '').trim();
    if (!radiusStr) {
        errors.radius = 'Укажите радиус генерации';
    } else {
        const radius = Number(radiusStr);
        if (!Number.isFinite(radius)) {
            errors.radius = 'Радиус должен быть числом';
        } else if (radius < RADIUS_MIN || radius > RADIUS_MAX) {
            errors.radius = `Радиус от ${RADIUS_MIN} до ${RADIUS_MAX} км`;
        }
    }

    const countStr = String(pointsCountRaw ?? '').trim();
    if (!countStr) {
        errors.pointsCount = 'Укажите количество точек';
    } else {
        const count = Number(countStr);
        if (!Number.isInteger(count)) {
            errors.pointsCount = 'Количество точек должно быть целым числом';
        } else if (count < POINTS_MIN || count > POINTS_MAX) {
            errors.pointsCount = `От ${POINTS_MIN} до ${POINTS_MAX} точек`;
        }
    }

    return errors;
}

export function getValidatedGenerationValues(radiusRaw, pointsCountRaw) {
    const errors = validateGenerationForm(radiusRaw, pointsCountRaw);
    if (Object.keys(errors).length > 0) {
        return { errors, values: null };
    }

    return {
        errors: {},
        values: {
            radiusKm: Number(String(radiusRaw).trim()),
            pointsCount: Number(String(pointsCountRaw).trim()),
        },
    };
}
