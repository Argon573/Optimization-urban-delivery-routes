import styles from "./PointForm.module.scss";

const PointList = ({ points }) => {
    return (
        <ul className={styles.list}>
            {points.map((point, index) => (
                <li key={point.id} className={styles.pointSection}>
                    <span className={styles.marker}>{index+1}</span>
                    <span className={styles.address}>{point.address}</span>
                </li>
            ))}
        </ul>
    )
}

    export default PointList;