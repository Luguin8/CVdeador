import { useState, useEffect } from 'react';

// 10 minutos en milisegundos
const COOLDOWN_MS = 10 * 60 * 1000;

export function useCooldown(lastUsageTimestamp: number) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    useEffect(() => {
        if (!lastUsageTimestamp) {
            setIsCoolingDown(false);
            setTimeLeft(0);
            return;
        }

        const calculateTime = () => {
            const now = Date.now();
            const timePassed = now - lastUsageTimestamp;
            const remaining = COOLDOWN_MS - timePassed;

            if (remaining > 0) {
                setTimeLeft(remaining);
                setIsCoolingDown(true);
            } else {
                setTimeLeft(0);
                setIsCoolingDown(false);
            }
        };

        calculateTime();
        // Actualizar el reloj cada segundo
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [lastUsageTimestamp]);

    // Formateador helper (ej: "09:45")
    const formattedTime = `${String(Math.floor(timeLeft / 60000)).padStart(2, '0')}:${String(
        Math.floor((timeLeft % 60000) / 1000)
    ).padStart(2, '0')}`;

    return { isCoolingDown, timeLeft, formattedTime };
}