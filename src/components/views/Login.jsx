import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, Mail, Lock, Loader, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle for simple sign up flow

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignUp) {
            await handleSignUp();
        } else {
            await handleLogin();
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            // AppContext will handle the auth state change
        } catch (err) {
            setError(err.message === "Invalid login credentials" ? "Credenciales inválidas." : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert("Registro exitoso. Por favor revisa tu correo para confirmar (si es necesario) o inicia sesión.");
            setIsSignUp(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img src="/logo.png" alt="Copa Delta" style={{ height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bienvenido</h2>
                <p style={{ opacity: 0.7 }}>Inicia sesión para continuar</p>
            </div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {error && (
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5' }}>
                            <AlertCircle size={18} />
                            <span style={{ fontSize: '14px' }}>{error}</span>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px',
                                    borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px',
                                    borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px', background: 'var(--primary-color)', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? <Loader className="spin" size={20} /> : (isSignUp ? "Registrarse" : "Ingresar")}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
                        >
                            {isSignUp ? "¿Ya tienes cuenta? Ingresa aquí" : "¿No tienes cuenta? Regístrate"}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', opacity: 0.5 }}>
                <Shield size={16} />
                <span style={{ fontSize: '12px' }}>Protegido por Supabase Auth</span>
            </div>
        </div>
    );
};

export default Login;
