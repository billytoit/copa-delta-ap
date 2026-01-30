import React from 'react';

const GoldSponsorFooter = () => {
    const sponsors = [
        { name: 'Fybeca', logo: '/fybeca.png' },
        { name: 'Atún Real', logo: '/real.png' },
        { name: 'Almax', logo: '/almax.png' },
    ];

    return (
        <div style={{
            width: '100%',
            padding: '15px 0',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '30px',
            paddingBottom: '30px',
            borderTop: '1px solid rgba(255,193,7,0.1)' // Golden hint
        }}>
            <span style={{
                fontSize: '10px',
                color: '#FFD700', // Gold color
                letterSpacing: '3px',
                fontWeight: '900',
                textTransform: 'uppercase',
                opacity: 0.8
            }}>
                Auspiciantes Gold
            </span>

            <div style={{
                display: 'flex',
                gap: '35px',
                overflowX: 'auto',
                width: '100%',
                padding: '10px 20px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                justifyContent: 'center',
                alignItems: 'center'
            }} className="no-scrollbar">
                {sponsors.map((s, idx) => (
                    <div key={idx} style={{
                        flexShrink: 0,
                        opacity: 0.7,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.opacity = '0.7';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <img
                            src={s.logo}
                            alt={s.name}
                            style={{
                                height: '45px',
                                maxWidth: '130px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoldSponsorFooter;
