import { useEffect, useRef } from 'react';

/**
 * Закрывает панель (подсказки и т.п.) при клике вне контейнера.
 * @param {boolean} isActive — слушатель включён, пока панель открыта
 * @param {() => void} onDismiss — колбэк закрытия
 * @returns {import('react').RefObject<HTMLElement>} ref на корневой элемент поля (input + выпадающий список)
 */
export function useDismissOnOutsideClick(isActive, onDismiss) {
    const containerRef = useRef(null);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    useEffect(() => {
        if (!isActive) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            const root = containerRef.current;
            if (!root || root.contains(event.target)) {
                return;
            }
            onDismissRef.current();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [isActive]);

    return containerRef;
}
