import React, { useState, useEffect } from 'react';

const MatchTimer = ({ startedAt }) => {
    const [time, setTime] = useState('00:00');

    useEffect(() => {
        const update = () => {
            // If startedAt is missing or invalid, define fallback or return
            if (!startedAt) {
                setTime('00:00');
                return;
            }
            const diff = Math.floor((Date.now() - startedAt) / 1000);
            if (diff < 0) {
                setTime('00:00');
                return;
            }
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            setTime(`${m}:${s}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);

    return <span>{time}</span>;
};

export default MatchTimer;
