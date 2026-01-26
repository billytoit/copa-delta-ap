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
                <img src="/logo.png?v=3" alt="Copa Delta" style={{ height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bienvenido</h2>
                <p style={{ opacity: 0.7 }}>Inicia sesión para continuar</p>
            </div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: window.location.origin
                                }
                            });
                            if (error) {
                                setError(error.message);
                                setLoading(false);
                            }
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            padding: '12px', background: 'white', color: '#333',
                            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                            cursor: 'pointer', transition: 'transform 0.2s'
                        }}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: '20px', height: '20px' }} />
                        Continuar con Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
                        <div style={{ height: '1px', flex: 1, background: 'white' }}></div>
                        <span style={{ fontSize: '12px' }}>O ingresa con correo</span>
                        <div style={{ height: '1px', flex: 1, background: 'white' }}></div>
                    </div>
                </div>

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

                    <div style={{ position: 'relative' }}>
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
                                required={!loading}
                            />
                        </div>
                        {!isSignUp && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!email) return setError("Ingresa tu correo primero para resetear la contraseña.");
                                    setLoading(true);
                                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                        redirectTo: window.location.origin + '/reset-password',
                                    });
                                    setLoading(false);
                                    if (error) setError(error.message);
                                    else alert("Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
                                }}
                                style={{
                                    float: 'right', marginTop: '5px', background: 'none', border: 'none',
                                    color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', opacity: 0.8
                                }}
                            >
                                Olvidé mi contraseña
                            </button>
                        )}
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
                            marginTop: '10px',
                            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(56, 189, 248, 0.4)';
                            }
                        }}
                    >
                        {loading ? <Loader className="spin" size={20} /> : (isSignUp ? "Registrarse" : "Ingresar")}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: 0,
                                marginLeft: '5px',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            {isSignUp ? "Ingresa aquí" : "Regístrate"}
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
