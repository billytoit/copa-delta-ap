import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { createPortal } from 'react-dom';

const PlayerAvatar = ({ photo, name, size = 60, borderSize = 2, borderColor = 'var(--primary)' }) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const photoSrc = photo;

    const handleAvatarClick = (e) => {
        if (photoSrc) {
            e.stopPropagation(); // Prevent parent clicks (like navigation in lists)
            setIsZoomed(true);
        }
    };

    const Modal = () => (
        <div
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
            className="fade-in"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(5px)',
                zIndex: 99999, // Super high to be on top of everything
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
                padding: '20px'
            }}
        >
            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                {/* Close Button Mobile Friendly */}
                <button
                    onClick={() => setIsZoomed(false)}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '0',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 100000
                    }}
                >
                    <X size={20} />
                </button>
                <img
                    src={photoSrc}
                    alt={name}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        border: `2px solid ${borderColor}`,
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }}
                />
                <div style={{
                    color: 'white',
                    textAlign: 'center',
                    marginTop: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {name}
                </div>
            </div>
        </div>
    );

    // Render using Portal to escape any "overflow: hidden" or "transform" parents
    const modalContent = isZoomed ? createPortal(<Modal />, document.body) : null;

    if (photoSrc) {
        return (
            <>
                <div
                    onClick={handleAvatarClick}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        border: `${borderSize}px solid ${borderColor}`,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--glass)',
                        cursor: 'zoom-in', // Hint that it's clickable
                        position: 'relative'
                    }}
                >
                    <img src={photoSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {modalContent}
            </>
        );
    }

    const nameStr = String(name || 'Jugador');
    const initials = nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
