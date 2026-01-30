import React from 'react';
import { User, Settings } from 'lucide-react';

const GlobalHeader = ({ user, onSettingsClick, onProfileClick, onHomeClick }) => {
    const getRoleBadge = () => {
        if (!user) return null;
        const roleColors = {
            'admin': { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308', label: 'ADMIN' },
            'official': { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'VEEDOR' },
            'veedor': { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'VEEDOR' },
            'operator': { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', label: 'OPERADOR' },
            'dirigente': { bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', label: 'DIRIGENTE' },
            'player': { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', label: 'JUGADOR' }
        };
        const userRole = user.role?.toLowerCase();
        const config = roleColors[userRole] || roleColors['player'];
        return (
            <span
                onClick={user.role === 'admin' ? onHomeClick : undefined}
                style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: config.bg,
                    color: config.color,
                    letterSpacing: '1px',
                    border: `1px solid ${config.color}`,
                    marginRight: '10px',
                    cursor: user.role === 'admin' ? 'pointer' : 'default'
                }}>
                {config.label}
            </span>
        );
    };

    return (
        <header className="fade-in" style={{ marginBottom: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div onClick={onHomeClick} style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <img src="/logo.png" alt="Copa Delta" style={{ height: '70px', objectFit: 'contain', transition: 'transform 0.2s' }} />
                </div>

                {/* Banco Pro Credit Sponsor Logo - Adjacent to Main Logo */}
                <a
                    href="https://bancoprocredit.com.ec/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.3s ease',
                        textDecoration: 'none',
                        height: '40px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                >
                    <img
                        src="/sponsor_procredit.png"
                        alt="Banco Pro Credit"
                        style={{ height: '22px', objectFit: 'contain' }}
                    />
                </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
        </header >
    );
};

export default GlobalHeader;
