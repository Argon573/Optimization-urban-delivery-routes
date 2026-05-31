import styles from './forms.module.scss'

const Radius = () =>  {
    return (
        <div>
            <span>Радиус</span>
            <input
                className={styles.radius}
                type="number"
                placeholder="Введите радиус"
            />
        </div>
    )
}

export default Radius;