import styles from './forms.module.scss'

const Radius = () =>  {
    return (
        <div>
            <span>Хуй</span>
            <input
                className={styles.radius}
                type="number"
                placeholder="Введи радиус"
            />
        </div>
    )
}

export default Radius;