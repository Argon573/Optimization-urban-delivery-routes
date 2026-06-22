import { useCallback, useState } from 'react';
import { usePhotonSearch } from '../../../hooks/usePhotonSearch';
import { useDismissOnOutsideClick } from '../../../hooks/useDismissOnOutsideClick';
import { geocodeAddress } from '../../../api/geocodeAddress';
import { parseAddress } from '../../../utils/parseAddress';
import { IoMdCheckmark } from 'react-icons/io';
import { ROUTE_POINTS_MAX } from '../../../constants/routeLimits';
import fieldStyles from '../../../shared/AddressField/AddressField.module.scss';

const POINTS_LIMIT_ERROR = `Максимум ${ROUTE_POINTS_MAX} точек`;

const WaypointInput = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const suggestions = usePhotonSearch(query, suggestionsOpen);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const showSuggestions = suggestionsOpen && suggestions.length > 0 && !isLoading;

    const closeSuggestions = useCallback(() => {
        setSuggestionsOpen(false);
    }, []);

    const fieldRef = useDismissOnOutsideClick(showSuggestions, closeSuggestions);

    const tryAddPoint = (point) => {
        const added = onSelect(point);
        if (added === false) {
            setError(POINTS_LIMIT_ERROR);
            return false;
        }

        setQuery('');
        setError('');
        setSuggestionsOpen(false);
        return true;
    };

    const handleSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;

        tryAddPoint({
            address: fullAddress,
            latitude: item.lat,
            longitude: item.lon,
        });
    };

    const handleManualSubmit = async () => {
        if (!query.trim()) {
            setError('Пожалуйста, введите адрес');
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

            tryAddPoint({
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
        <div ref={fieldRef} className={fieldStyles.field}>
            <div className={`${fieldStyles.inputBox} ${error ? fieldStyles.inputError : ''}`}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSuggestionsOpen(e.target.value.trim().length >= 3);
                        if (error) setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Начните вводить адрес..."
                    className={fieldStyles.input}
                    disabled={isLoading}
                />
                <button
                    onClick={handleManualSubmit}
                    className={fieldStyles.submitButton}
                    type="button"
                    disabled={isLoading}
                    aria-label="Добавить точку"
                >
                    {isLoading
                        ? <div className={fieldStyles.loader} />
                        : <IoMdCheckmark className={fieldStyles.checkmark} />}
                </button>
            </div>

            {error && <div className={fieldStyles.errorMessage}>{error}</div>}

            {showSuggestions && (
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

export default WaypointInput;
