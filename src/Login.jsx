import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulación de autenticación simplificada para demo
        if (email === 'admin@delta.com' && password === 'delta2026') {
            onLogin({ id: 0, name: 'Admin Delta', role: 'admin', email });
        } else if (email === 'operador@atletico.com' && password === 'atletico2026') {
            onLogin({ id: 101, name: 'Dirigente Atlético', role: 'operador', email, teamId: 1 });
        } else if (email === 'veedor@delta.com' && password === 'admin') {
            onLogin({ id: 1, name: 'Carlos Veedor', role: 'veedor', email });
        } else if (email === 'jugador@delta.com' && password === '1234') {
            onLogin({ id: 2, name: 'Juan Jugador', role: 'jugador', email });
        } else {
            setError('Credenciales inválidas. Adm: admin@delta.com/delta2026, Op: operador@atletico.com/atletico2026');
        }
    };

    return (
        <div className="container fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 className="title-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Bienvenido</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Ingresa a la Copa Delta</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px 12px 12px 40px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px 12px 12px 40px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>{error}</p>}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: '14px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(56, 189, 248, 0.2)'
                        }}
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Acceso exclusivo para padres registrados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
