import { useState } from "react";
import styles from "./Form.module.scss";

const Form = ({ title, placeholder, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(value);
        setValue('');
    };

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <span className={styles.title}>{title}</span>
            <input
                type="text"
                className={styles.input}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit" className={styles.button}>
                Отправить
            </button>
        </form>
    );
};

export default Form;