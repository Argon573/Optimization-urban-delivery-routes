export function runSimulatedProgress(durationMs, onProgress) {
    return new Promise((resolve) => {
        const start = Date.now();

        const tick = () => {
            const elapsed = Date.now() - start;
            const percent = Math.min(100, Math.round((elapsed / durationMs) * 100));
            onProgress(percent);

            if (percent >= 100) {
                resolve();
            } else {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    });
}
