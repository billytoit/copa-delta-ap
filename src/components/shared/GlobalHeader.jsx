import React from 'react';
import { User, Settings } from 'lucide-react';

const GlobalHeader = ({ user, onSettingsClick, onProfileClick }) => {
    const getRoleBadge = () => {
        if (!user) return null;
        const roleColors = {
            'admin': { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308', label: 'ADMIN' },
            'official': { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'VEEDOR' },
            'operator': { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', label: 'OPERADOR' },
            'player': { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', label: 'JUGADOR' }
        };
        const config = roleColors[user.role] || roleColors['player'];
        return (
            <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '6px',
                background: config.bg,
                color: config.color,
                letterSpacing: '1px',
                border: `1px solid ${config.color}`,
                marginRight: '10px'
            }}>
                {config.label}
            </span>
        );
    };

    return (
        <header className="fade-in" style={{ marginBottom: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <img src="/logo.png" alt="Copa Delta" style={{ height: '50px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getRoleBadge()}

                {/* Profile Access Button */}
                {user && (
                    <div
                        onClick={onProfileClick}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'var(--glass)',
                            border: '1px solid var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} color="white" />
                        )}
                    </div>
                )}

                <div
                    className="glass-card"
                    style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '38px', height: '38px' }}
                    onClick={onSettingsClick}
                >
                    <Settings size={18} color="var(--text-secondary)" />
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
