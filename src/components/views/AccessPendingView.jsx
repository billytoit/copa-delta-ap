import React from 'react';
import { Lock, LogOut, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AccessPendingView = () => {
    const { logout, user } = useApp();

    return (
        <div className="fade-in" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-color)'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '2px solid #eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                boxShadow: '0 0 30px rgba(234, 179, 8, 0.2)'
            }}>
                <Lock size={40} color="#eab308" />
            </div>

            <h1 className="title-gradient" style={{ fontSize: '28px', marginBottom: '10px' }}>Acceso Restringido</h1>

            <div className="glass-card" style={{ marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '15px' }}>
                    Hola <strong>{user?.email}</strong>,
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Esta aplicación es exclusiva para miembros verificados del torneo <strong>Copa Delta</strong>.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', fontSize: '13px' }}>
                    <CheckCircle size={16} color="var(--primary)" style={{ marginBottom: '5px' }} />
                    <p style={{ margin: 0 }}>Tu solicitud ha sido recibida.</p>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.7 }}>Te notificaremos cuando tu identidad y pago sean validados.</p>
                </div>
            </div>

            <button
                onClick={logout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '30px',
                    color: 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                <LogOut size={16} /> Cerrar Sesión
            </button>
        </div>
    );
};

export default AccessPendingView;
