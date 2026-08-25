import { useState, useEffect } from 'react';
import { useClockSettings } from '../hooks/useClockSettings';

export function Clock({ hasWallpaper }) {
    const [time, setTime] = useState(new Date());
    const { showClock, clockFormat } = useClockSettings();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!showClock) {
        return null;
    }

    const formatTime = (date) => {
        if (clockFormat === '24h') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const textColorClass = hasWallpaper ? 'text-white drop-shadow-lg' : 'text-text-primary';

    return (
        <div className="flex flex-col items-center justify-center pt-1 pb-3 sm:pt-2 sm:pb-4 lg:py-8 select-none">
            <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-1 lg:mb-2 transition-colors duration-300 ${textColorClass}`}>
                {formatTime(time)}
            </h1>
            <p className={`text-base sm:text-lg lg:text-2xl font-medium opacity-90 transition-colors duration-300 ${textColorClass}`}>
                {formatDate(time)}
            </p>
        </div>
    );
}
