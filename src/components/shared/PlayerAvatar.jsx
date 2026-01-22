import React from 'react';

const PlayerAvatar = ({ photo, name, size = 60, borderSize = 2, borderColor = 'var(--primary)' }) => {
    const photoSrc = photo; // This can be photo_url or data URL from upload
    if (photoSrc) {
        return (
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `${borderSize}px solid ${borderColor}`,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--glass)'
            }}>
                <img src={photoSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: `${borderSize}px solid ${borderColor}`,
            background: 'var(--glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: `${size / 2.5}px`,
            fontWeight: 'bold',
            color: borderColor
        }}>
            {initials}
        </div>
    );
};

export default PlayerAvatar;
