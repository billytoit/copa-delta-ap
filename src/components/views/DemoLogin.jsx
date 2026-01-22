import React from 'react';
import { Shield, FileText, Users, User } from 'lucide-react';

const DemoLogin = ({ onLogin }) => {
    const mockUsers = [
        {
            roleLabel: 'Admin',
            roleName: 'admin',
            icon: <Shield size={32} color="#3b82f6" />,
            user: { role: 'admin', name: 'Admin Demo' }
        },
        {
            roleLabel: 'Veedor',
            roleName: 'official',
            icon: <FileText size={32} color="#f59e0b" />,
            user: { role: 'official', id: 'off-8001-uuid', name: 'Victor Veedor' }
        },
        {
            roleLabel: 'Operador',
            roleName: 'operador',
            icon: <Users size={32} color="#10b981" />,
            user: { role: 'operador', name: 'Carlos Ruiz', teamId: 5 }
        },
        {
            roleLabel: 'Jugador',
            roleName: 'jugador',
            icon: <User size={32} color="#8b5cf6" />,
            user: { role: 'jugador', name: 'Juan Jugador', id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', teamId: 1 }
        }
    ];

    return (
        <div className="fade-in" style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img src="/logo.png" alt="Copa Delta" style={{ height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                <br />
                <span style={{ fontSize: '16px', opacity: 0.7, letterSpacing: '2px', color: 'var(--text-secondary)' }}>MODO DEMO</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {mockUsers.map((item) => (
                    <div
                        key={item.roleLabel}
                        onClick={() => onLogin(item.user)}
                        className="glass-card"
                        style={{
                            padding: '30px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: '1px solid var(--glass-border)',
                            transition: 'transform 0.2s',
                            gap: '15px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {item.icon}
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.roleLabel}</span>
                    </div>
                ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                Selecciona un rol para ingresar sin contraseña.
                <br />
                <span style={{ opacity: 0.5 }}>DEMO_MODE=Active</span>
            </p>
        </div>
    );
};

export default DemoLogin;
