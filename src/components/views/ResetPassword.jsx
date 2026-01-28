import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Loader, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Las contraseñas no coinciden.");
        }
        if (password.length < 6) {
            return setError("La contraseña debe tener al menos 6 caracteres.");
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fade-in" style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>¡Contraseña Actualizada!</h2>
                    <p style={{ opacity: 0.7, marginBottom: '20px' }}>Tu contraseña ha sido cambiada con éxito. Serás redirigido al login en unos segundos...</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ padding: '12px 24px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Ir al Login ahora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img src="/logo.png?v=3" alt="Copa Delta" style={{ height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Nueva Contraseña</h2>
                <p style={{ opacity: 0.7 }}>Ingresa tu nueva clave de acceso</p>
            </div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {error && (
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5' }}>
                            <AlertCircle size={18} />
                            <span style={{ fontSize: '14px' }}>{error}</span>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Nueva Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 48px 12px 40px',
                                    borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none'
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '11px',
                                    background: 'none', border: 'none', color: 'var(--primary)',
                                    cursor: 'pointer', padding: '2px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Confirmar Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 48px 12px 40px',
                                    borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none'
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '11px',
                                    background: 'none', border: 'none', color: 'var(--primary)',
                                    cursor: 'pointer', padding: '2px'
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '14px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? <Loader className="spin" size={20} /> : "Actualizar Contraseña"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
