import { useState } from 'react';
import { useRoute } from '../../../context/RouteContext';
import { generateRoutePoints } from '../../../api/generateRoutePoints';
import {
    getValidatedGenerationValues,
    validateGenerationForm,
    RADIUS_MIN,
    RADIUS_MAX,
    POINTS_MIN,
    POINTS_MAX,
} from './validateGenerationForm';
import styles from './generation.module.scss';

const GenerationMenu = () => {
    const { setGeneratedPoints } = useRoute();
    const [radius, setRadius] = useState('');
    const [pointsCount, setPointsCount] = useState('');
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRadiusChange = (e) => {
        setRadius(e.target.value);
        if (errors.radius || submitError) {
            setErrors((prev) => ({ ...prev, radius: undefined }));
            setSubmitError('');
        }
    };

    const handlePointsCountChange = (e) => {
        setPointsCount(e.target.value);
        if (errors.pointsCount || submitError) {
            setErrors((prev) => ({ ...prev, pointsCount: undefined }));
            setSubmitError('');
        }
    };

    const handleBlur = () => {
        setErrors(validateGenerationForm(radius, pointsCount));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        const { errors: validationErrors, values } = getValidatedGenerationValues(radius, pointsCount);

        if (!values) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitError('');
        setIsLoading(true);

        try {
            const data = await generateRoutePoints({
                radiusKm: values.radiusKm,
                pointsCount: values.pointsCount,
            });

            const mapped = data.points.map((point, index) => ({
                id: point.id ?? Date.now() + index,
                address: `Сгенерированная точка ${index + 1}`,
                latitude: point.lat,
                longitude: point.lon,
            }));

            setGeneratedPoints(mapped);
        } catch (err) {
            setSubmitError(err.message || 'Ошибка генерации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.menu} onSubmit={handleGenerate} noValidate>
            <label className={styles.field}>
                <span className={styles.label}>Радиус генерации (км)</span>
                <input
                    type="number"
                    className={`${styles.input} ${errors.radius ? styles.inputError : ''}`}
                    placeholder={`${RADIUS_MIN}–${RADIUS_MAX}`}
                    min={RADIUS_MIN}
                    max={RADIUS_MAX}
                    step="0.1"
                    value={radius}
                    onChange={handleRadiusChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                />
                {errors.radius && <span className={styles.error}>{errors.radius}</span>}
            </label>

            <label className={styles.field}>
                <span className={styles.label}>Количество точек</span>
                <input
                    type="number"
                    className={`${styles.input} ${errors.pointsCount ? styles.inputError : ''}`}
                    placeholder={`${POINTS_MIN}–${POINTS_MAX}`}
                    min={POINTS_MIN}
                    max={POINTS_MAX}
                    step="1"
                    value={pointsCount}
                    onChange={handlePointsCountChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                />
                {errors.pointsCount && <span className={styles.error}>{errors.pointsCount}</span>}
            </label>

            {submitError && <span className={styles.error}>{submitError}</span>}

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Генерация…' : 'Генерация'}
            </button>
        </form>
    );
};

export default GenerationMenu;
