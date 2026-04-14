import styles from './marker.module.scss';


const Marker = ({ point, YMapMarker }) => {
    return (
        <YMapMarker coordinates={point.coords}>
            <div className={styles.marker}></div>
        </YMapMarker>
    )
}

export default Marker;