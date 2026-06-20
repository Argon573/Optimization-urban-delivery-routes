import { useEffect, useRef, useState } from 'react';
import styles from './TransportSelect.module.scss';

export const TRANSPORT_OPTIONS = [
    { value: 'car', label: 'Автомобиль' },
    { value: 'walking', label: 'Пеший маршрут' },
];

const TransportSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const selected = TRANSPORT_OPTIONS.find((opt) => opt.value === value) ?? TRANSPORT_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <span className={styles.title}>Вид транспорта</span>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                {selected.label}
            </button>
            {open && (
                <ul className={styles.dropdown} role="listbox">
                    {TRANSPORT_OPTIONS.map((option) => (
                        <li key={option.value}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option.value === value}
                                className={`${styles.option} ${option.value === value ? styles.optionActive : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TransportSelect;
