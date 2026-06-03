import { useState, useEffect } from 'react';
import { usePhotonSearch } from '../../../hooks/usePhotonSearch';
import { getGeocodeFromAddress } from '../../../hooks/getGeocodeFromAddress';
import { parseAddress } from '../../../utils/parseAddress';
import { IoMdCheckmark } from 'react-icons/io';
import fieldStyles from '../StartPointForm/StartPointForm.module.scss';

const PointForm = ({ onSelect, onSuggestionsOpen }) => {
    const [query, setQuery] = useState('');
    const suggestions = usePhotonSearch(query);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const hasSuggestions = suggestions.length > 0 && !isLoading;

    useEffect(() => {
        onSuggestionsOpen?.(hasSuggestions);
    }, [hasSuggestions, onSuggestionsOpen]);

    const handleSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;

        onSelect({
            address: fullAddress,
            latitude: item.lat,
            longitude: item.lon,
        });

        setQuery('');
        setError('');
    };

    const handleManualSubmit = async () => {
        if (!query.trim()) {
            setError('Пожалуйста, введите адрес');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const parts = parseAddress(query);

            if (parts.length !== 2 || !parts[1]) {
                setError('Введите полный адрес');
                return;
            }

            const geocode = await getGeocodeFromAddress({
                street: parts[0],
                house: parts[1],
            });

            if (geocode === null) {
                setError('Такого адреса не существует!');
                return;
            }

            onSelect({
                address: query,
                latitude: geocode.lat,
                longitude: geocode.lon,
            });

            setQuery('');
            setError('');
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
            <div className={`${fieldStyles.inputBox} ${error ? fieldStyles.inputError : ''}`}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
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

            {hasSuggestions && (
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

export default PointForm;
