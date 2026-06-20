import { useCallback, useState } from 'react';
import { LuMapPin } from 'react-icons/lu';
import { IoMdCheckmark } from 'react-icons/io';
import layoutStyles from '../../layouts/layout.module.scss';
import { useRoute } from '../../../context/RouteContext';
import { usePhotonSearch } from '../../../hooks/usePhotonSearch';
import { useDismissOnOutsideClick } from '../../../hooks/useDismissOnOutsideClick';
import { geocodeAddress } from '../../../api/geocodeAddress';
import { parseAddress } from '../../../utils/parseAddress';
import { PRIORITY_OPTIONS, POINT_PRIORITIES } from '../../../constants/pointPriority';
import { DEFAULT_POINT_NAME } from '../../../utils/pointName';
import fieldStyles from '../../../shared/AddressField/AddressField.module.scss';
import styles from './WaypointSettings.module.scss';

const WaypointSettings = ({ point, listIndex, onBack }) => {
    const { updatePoint, removePoint, focusOnMap } = useRoute();
    const [priority, setPriority] = useState(point.priority ?? POINT_PRIORITIES.NORMAL);
    const [name, setName] = useState(point.name?.trim() || DEFAULT_POINT_NAME);
    const [address, setAddress] = useState(point.address);
    const [latitude, setLatitude] = useState(point.latitude);
    const [longitude, setLongitude] = useState(point.longitude);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [addressError, setAddressError] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const suggestions = usePhotonSearch(address, suggestionsOpen);
    const showSuggestions = suggestionsOpen && suggestions.length > 0 && !isGeocoding;

    const closeSuggestions = useCallback(() => {
        setSuggestionsOpen(false);
    }, []);

    const fieldRef = useDismissOnOutsideClick(showSuggestions, closeSuggestions);

    const priorityColor = PRIORITY_OPTIONS.find((o) => o.value === priority)?.color;

    const applyCoordinates = (nextAddress, lat, lon) => {
        setAddress(nextAddress);
        setLatitude(lat);
        setLongitude(lon);
        setAddressError('');
        setSuggestionsOpen(false);
    };

    const handleSuggestionSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;
        applyCoordinates(fullAddress, item.lat, item.lon);
    };

    const geocodeCurrentAddress = async () => {
        if (!address.trim()) {
            setAddressError('Пожалуйста, введите адрес');
            return false;
        }

        setIsGeocoding(true);
        setAddressError('');
        setSuggestionsOpen(false);

        try {
            const parts = parseAddress(address);

            if (parts.length !== 2 || !parts[1]) {
                setAddressError('Введите полный адрес');
                return false;
            }

            const geocode = await geocodeAddress({
                street: parts[0],
                house: parts[1],
            });

            if (geocode === null) {
                setAddressError('Такого адреса не существует!');
                return false;
            }

            setLatitude(geocode.lat);
            setLongitude(geocode.lon);
            return true;
        } catch {
            setAddressError('Ошибка при обработке адреса. Попробуйте еще раз.');
            return false;
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSave = async () => {
        const trimmedAddress = address.trim();

        if (!trimmedAddress) {
            setAddressError('Пожалуйста, введите адрес');
            return;
        }

        setIsSaving(true);

        try {
            let nextLat = latitude;
            let nextLon = longitude;

            if (trimmedAddress !== point.address) {
                const parts = parseAddress(trimmedAddress);

                if (parts.length !== 2 || !parts[1]) {
                    setAddressError('Введите полный адрес');
                    return;
                }

                const geocode = await geocodeAddress({
                    street: parts[0],
                    house: parts[1],
                });

                if (geocode === null) {
                    setAddressError('Такого адреса не существует!');
                    return;
                }

                nextLat = geocode.lat;
                nextLon = geocode.lon;
            }

            updatePoint(point.id, {
                name: name.trim() || DEFAULT_POINT_NAME,
                address: trimmedAddress,
                latitude: nextLat,
                longitude: nextLon,
                priority,
            });
            onBack();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        removePoint(point.id);
        onBack();
    };

    const handleShowOnMap = () => {
        focusOnMap(latitude, longitude);
    };

    const handleAddressKeyDown = (event) => {
        if (event.key === 'Enter' && !isGeocoding && !isSaving) {
            geocodeCurrentAddress();
        }
    };

    return (
        <div className={layoutStyles.pagePanel}>
            <div className={layoutStyles.pageContent}>
                <button type="button" className={styles.backButton} onClick={onBack}>
                    ← настройки точки
                </button>

                <div
                    className={styles.pointCard}
                    style={{ '--priority-color': priorityColor }}
                >
                    <span
                        className={styles.pointBadge}
                        style={{ backgroundColor: priorityColor }}
                    >
                        {listIndex + 1}
                    </span>
                    <input
                        type="text"
                        className={styles.pointNameInput}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={DEFAULT_POINT_NAME}
                        aria-label="Название точки"
                        disabled={isSaving}
                    />
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Адрес</span>
                    <div ref={fieldRef} className={fieldStyles.field}>
                        <div className={`${fieldStyles.inputBox} ${addressError ? fieldStyles.inputError : ''}`}>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value);
                                    setSuggestionsOpen(e.target.value.trim().length >= 3);
                                    if (addressError) setAddressError('');
                                }}
                                onKeyDown={handleAddressKeyDown}
                                placeholder="Введите адрес..."
                                className={fieldStyles.input}
                                disabled={isGeocoding || isSaving}
                            />
                            <button
                                type="button"
                                onClick={geocodeCurrentAddress}
                                className={fieldStyles.submitButton}
                                disabled={isGeocoding || isSaving}
                                aria-label="Подтвердить адрес"
                            >
                                {isGeocoding
                                    ? <div className={fieldStyles.loader} />
                                    : <IoMdCheckmark className={fieldStyles.checkmark} />}
                            </button>
                        </div>

                        {addressError && (
                            <div className={fieldStyles.errorMessage}>{addressError}</div>
                        )}

                        {showSuggestions && (
                            <ul className={fieldStyles.autoComplete}>
                                {suggestions.map((item, index) => (
                                    <li
                                        key={index}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSuggestionSelect(item)}
                                        className={fieldStyles.autocompleteElement}
                                    >
                                        {item.street || ''} {item.name}, {item.city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <button type="button" className={styles.showOnMapButton} onClick={handleShowOnMap}>
                    <LuMapPin className={styles.showOnMapIcon} />
                    Показать на карте
                </button>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Приоритет</span>
                    <div className={styles.priorityList}>
                        {PRIORITY_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className={`${styles.priorityOption} ${priority === option.value ? styles.priorityOptionActive : ''}`}
                                style={{ '--priority-color': option.color }}
                            >
                                <span className={styles.priorityLabel}>{option.label}</span>
                                <input
                                    type="radio"
                                    name={`priority-${point.id}`}
                                    value={option.value}
                                    checked={priority === option.value}
                                    onChange={() => setPriority(option.value)}
                                    className={styles.priorityRadio}
                                />
                                <span className={styles.priorityRadioVisual} />
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={isSaving || isGeocoding}
                    >
                        {isSaving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                    <button type="button" className={styles.cancelButton} onClick={onBack}>
                        Отмена
                    </button>
                    <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                        Удалить точку
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaypointSettings;
