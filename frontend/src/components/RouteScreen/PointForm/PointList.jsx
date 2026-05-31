import styles from "./PointForm.module.scss";
import PointForm from "./PointForm";

const PointList = ({ points, addPoint }) => {
    return (
        <ul className={styles.list}>
            {points.map((point, index) => (
                <li key={point.id} className={styles.pointSection}>
                    <span className={styles.marker}>
                        <span>{index+1}</span>
                    </span>
                    <span className={styles.address}>{point.address}</span>
                </li>
            ))}
            <li className={styles.pointSection}>
                <PointForm onSelect={addPoint} />
            </li>
        </ul>
    )
}

    export default PointList;