import { useEffect, useState } from 'react';
import { IoMdCheckmark } from 'react-icons/io';
import { usePhotonSearch } from '../../../hooks/usePhotonSearch';
import { geocodeAddress } from '../../../api/geocodeAddress';
import { parseAddress } from '../../../utils/parseAddress';
import { useRoute } from '../../../context/RouteContext';
import fieldStyles from '../../../shared/AddressField/AddressField.module.scss';

const PLACEHOLDER_GRANTED = 'Мое местоположение';
const PLACEHOLDER_DENIED = 'Введите стартовую точку';

const StartPointForm = () => {
    const { startPoint, setStartPoint, geolocationStatus, applyUserLocation } = useRoute();
    const [query, setQuery] = useState('');
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const suggestions = usePhotonSearch(query, suggestionsOpen);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const placeholder = geolocationStatus === 'granted'
        ? PLACEHOLDER_GRANTED
        : PLACEHOLDER_DENIED; // idle | denied

    useEffect(() => {
        if (startPoint && !startPoint.isUserLocation) {
            setQuery(startPoint.address);
            setSuggestionsOpen(false);
        } else if (!startPoint || startPoint.isUserLocation) {
            setQuery('');
            setSuggestionsOpen(false);
        }
    }, [startPoint]);

    const applyManualStartPoint = (point) => {
        setSuggestionsOpen(false);
        setStartPoint({
            id: 'start',
            address: point.address,
            latitude: point.latitude,
            longitude: point.longitude,
            isUserLocation: false,
        });
        setQuery(point.address);
        setError('');
    };

    const handleSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;

        applyManualStartPoint({
            address: fullAddress,
            latitude: item.lat,
            longitude: item.lon,
        });
    };

    const handleUseGeolocation = async () => {
        setSuggestionsOpen(false);
        setIsLoading(true);
        setError('');

        const success = await applyUserLocation();

        if (success) {
            setQuery('');
        } else {
            setError('Разрешите доступ к геолокации в браузере');
        }

        setIsLoading(false);
    };

    const handleManualSubmit = async () => {
        if (!query.trim()) {
            await handleUseGeolocation();
            return;
        }

        setSuggestionsOpen(false);
        setIsLoading(true);
        setError('');

        try {
            const parts = parseAddress(query);

            if (parts.length !== 2 || !parts[1]) {
                setError('Введите полный адрес');
                return;
            }

            const geocode = await geocodeAddress({
                street: parts[0],
                house: parts[1],
            });

            if (geocode === null) {
                setError('Такого адреса не существует!');
                return;
            }

            applyManualStartPoint({
                address: query,
                latitude: geocode.lat,
                longitude: geocode.lon,
            });
        } catch (err) {
            console.error(err);
            setError('Ошибка при обработке адреса. Попробуйте еще раз.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleManualSubmit();
        }
    };

    return (
        <div className={fieldStyles.field}>
            <span className={fieldStyles.title}>Отправная точка</span>

            <div className={`${fieldStyles.inputBox} ${error ? fieldStyles.inputError : ''}`}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSuggestionsOpen(e.target.value.trim().length >= 3);
                        if (error) setError('');
                    }}
                    onBlur={() => {
                        setTimeout(() => setSuggestionsOpen(false), 150);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={fieldStyles.input}
                    disabled={isLoading}
                />
                <button
                    onClick={handleManualSubmit}
                    className={fieldStyles.submitButton}
                    type="button"
                    disabled={isLoading}
                    aria-label={
                        query.trim()
                            ? 'Подтвердить адрес'
                            : 'Использовать моё местоположение'
                    }
                >
                    {isLoading
                        ? <div className={fieldStyles.loader} />
                        : <IoMdCheckmark className={fieldStyles.checkmark} />}
                </button>
            </div>

            {error && <div className={fieldStyles.errorMessage}>{error}</div>}

            {suggestionsOpen && suggestions.length > 0 && !isLoading && (
                <ul className={fieldStyles.autoComplete}>
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(item)}
                            className={fieldStyles.autocompleteElement}
                        >
                            {item.street || ''} {item.name}, {item.city}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StartPointForm;
