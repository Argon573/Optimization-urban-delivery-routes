import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from "./PointForm.module.scss";
import PointForm from "./PointForm";

const PointList = ({ points, addPoint, removePoint }) => {
    const [autocompleteOpen, setAutocompleteOpen] = useState(false); 

    return (
        <ul
          className={styles.list}
          style={{ paddingBottom: autocompleteOpen ? '160px' : '0' }}
        >
            {points.map((point, index) => (
                <li key={point.id} className={styles.pointSection}>
                    <span className={styles.marker}>
                        <span>{index + 1}</span>
                    </span>
                    <span className={styles.address}>{point.address}</span>
                    <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removePoint(point.id)}
                        aria-label="Удалить точку"
                    >
                        <IoClose />
                    </button>
                </li>
            ))}
            <li className={styles.pointSection}>
                <span className={styles.markerPlaceholder} aria-hidden />
                <div className={styles.formCell}>
                    <PointForm
                        onSelect={addPoint}
                        onSuggestionsOpen={setAutocompleteOpen}
                    />
                </div>
            </li>
        </ul>
    );
};

export default PointList;