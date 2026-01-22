import React from 'react';

const NavButton = ({ icon: Icon, label, active, onClick }) => (
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
        <Icon size={24} style={{ marginBottom: '4px', opacity: active ? 1 : 0.6 }} />
        <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>{label}</span>
        {active && <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', marginTop: '4px' }} />}
    </button>
);

export default NavButton;
