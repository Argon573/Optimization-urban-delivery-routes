import styles from './buttons.module.scss';

const GenerationButton = ({ isOpen, onClick }) => {
    return (
        <button
            type="button"
            className={`${styles.generationButton} ${isOpen ? styles.generationButtonActive : ''}`}
            onClick={onClick}
            aria-expanded={isOpen}
        >
            Генерация точек
        </button>
    );
};

export default GenerationButton;