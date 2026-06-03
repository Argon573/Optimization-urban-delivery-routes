import { useState, useEffect } from "react";
import { usePhotonSearch } from "../../../hooks/usePhotonSearch";
import styles from "./PointForm.module.scss";
import { getGeocodeFromAddress } from "../../../hooks/getGeocodeFromAddress";
import { parseAddress } from "../../../utils/parseAddress";
import { IoMdCheckmark } from "react-icons/io";

const PointForm = ({ onSelect, onSuggestionsOpen }) => {
    const [query, setQuery] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const suggestions = usePhotonSearch(query);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const hasSuggestions = suggestions.length > 0 && !isLoading;
    
    useEffect(() => {
        onSuggestionsOpen?.(hasSuggestions);
    }, [hasSuggestions]);

    

    const handleSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;

        onSelect({
            address: fullAddress,
            latitude: item.lat,
            longitude: item.lon
        });

        setCurrentAddress(fullAddress);
        setQuery('');
        setError('');
    };

    const handleManualSubmit = async () => {
        // Валидация: проверяем, что поле не пустое
        if (!query.trim()) {
            setError("Пожалуйста, введите адрес");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const parts = parseAddress(query)

            if (parts.length !== 2) {
                setError("Введите полный адрес");
                return;
            }

            const address = {
                street: parts[0],
                house: parts[1]
            };

            console.log(address);

            const geocode = await getGeocodeFromAddress(address);

            if (geocode === null) {
                setError("Такого адреса не существует!");
                setIsLoading(false);
                return;
            }

            console.log(geocode);

            // Успешное получение координат
            onSelect({
                address: query,
                latitude: geocode.lat,
                longitude: geocode.lon
            });

            setCurrentAddress(query);
            setQuery('');
            setError('');

        } catch (error) {
            console.error('Ошибка:', error);
            setError("Ошибка при обработке адреса. Попробуйте еще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleManualSubmit();
        }
    };

    return (
        <div style={{ position: "relative" }} className={styles.inputForm}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (error) setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Начните вводить адрес..."
                    className={`${styles.inputPoint} ${error ? styles.inputError : ''}`}
                    disabled={isLoading}
                />
                <button
                    onClick={handleManualSubmit}
                    className={styles.submitButton}
                    type="button"
                    disabled={isLoading}
                >
                    {isLoading ? <div className={styles.loader}></div> : <IoMdCheckmark className={styles.checkmark}/>}
                </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {suggestions.length > 0 && !isLoading && (
                <ul className={styles.autoComplete}>
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className={styles.autocompleteElement}
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