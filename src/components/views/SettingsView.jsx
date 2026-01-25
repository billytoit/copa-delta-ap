import React from 'react';
import { Trophy, FileText, Download, LogOut } from 'lucide-react';

const SettingsView = ({ teams, onLogout }) => {
    const BUILD_VERSION = "22/1/2026, 00:38 AM"; // Hardcoded for reliability
    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Ajustes</h1>

            <div className="glass-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} /> Registros del Torneo
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--secondary)' }}>{teams.length}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Equipos</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                            {teams.reduce((acc, t) => acc + t.players.length, 0)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Jugadores</div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Reglamento Oficial
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
                    Consulta la normativa completa de la Copa Delta 2026.
                </p>
                <a
                    href="/reglamento.pdf"
                    download
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        textDecoration: 'none',
                        color: 'white',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #034694 100%)',
                        padding: '15px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Download size={18} />
                    Descargar Reglamento PDF
                </a>
            </div>

            <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '10px', marginTop: 'var(--spacing-xl)' }}>
                Copa Delta App v1.5 • {BUILD_VERSION}
            </p>
        </div>
    );
};

export default SettingsView;
