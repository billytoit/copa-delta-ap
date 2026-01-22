import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { SOCIAL_MESSAGES } from '../../data.js';

const SocialBanner = () => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % SOCIAL_MESSAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="glass-card" style={{
            marginBottom: 'var(--spacing-md)',
            padding: '12px 20px',
            borderLeft: '4px solid var(--primary)',
            background: 'linear-gradient(90deg, rgba(var(--primary-rgb), 0.1), transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minHeight: '60px'
        }}>
            <MessageCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
            <p className="fade-in" key={currentIdx} style={{
                fontSize: '13px',
                fontWeight: '500',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: '1.4'
            }}>
                {SOCIAL_MESSAGES[currentIdx]}
            </p>
        </div>
    );
};

export default SocialBanner;
