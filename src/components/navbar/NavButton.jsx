import React from 'react';

const NavButton = ({ icon: Icon, label, active, onClick, hasBadge }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '5px 0',
            flex: 1
        }}
    >
        <div style={{ position: 'relative', marginBottom: '4px' }}>
            <Icon size={24} style={{ opacity: active ? 1 : 0.6 }} />
            {hasBadge && (
                <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: '1.5px solid var(--bg-color)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                }} />
            )}
        </div>
        <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>{label}</span>
        {active && <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', marginTop: '4px' }} />}
    </button>
);

export default NavButton;
