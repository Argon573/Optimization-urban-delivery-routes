import { useState } from "react";
import { usePhotonSearch } from "../../../hooks/usePhotonSearch";
import styles from "./PointForm.module.scss";

const PointForm = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const suggestions = usePhotonSearch(query);


    const handleSelect = (item) => {
        const fullAddress = `${item.street || ''} ${item.name || ''}, Екатеринбург`;

        onSelect({
            address: fullAddress,
            latitude: item.lat,
            longitude: item.lon
        });

        setCurrentAddress(fullAddress);

        setQuery('');
    };

    return (
        <div style={{ position: "relative" }} className={styles.inputForm}>
            <label>Адрес</label>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Начните вводить адрес..."
            />

            {suggestions.length > 0 && (
                <ul className={styles.autoComplete}>
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
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