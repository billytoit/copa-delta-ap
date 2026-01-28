import React, { useState } from 'react';
import { User, Lock, Edit3, Trophy, Phone, Mail, LogOut, Instagram } from 'lucide-react';

const UserProfileView = ({ user, onUpdateUser, onLogout }) => {
    // Local state for editable fields
    const [formData, setFormData] = useState({
        nickname: user.nickname || '',
        job: user.job || '',
        bio: user.bio || '',
        footedness: user.footedness || 'Derecho',
        phone: user.phone || '',
        email: user.email || '',
        instagram: user.instagram || '',
        notifications: user.notifications || { matches: true, voting: true, schedule: true }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleChange = (field, value) => {
        // Validations
        if (field === 'job' && value.length > 40) return;
        if (field === 'bio' && value.length > 120) return;
        if (field === 'instagram') {
            // Basic handle validation: no spaces
            if (value.includes(' ')) return;
        }

        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            if (onUpdateUser) {
                await onUpdateUser({ ...user, ...formData });
            }
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setIsSaving(true); // Wait, should be false
            setIsSaving(false);
        }
    };

    const SectionTitle = ({ icon: Icon, title }) => (
        <h3 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>
            <Icon size={16} /> {title}
        </h3>
    );

    return (
        <div className="fade-in" style={{ paddingBottom: '100px' }}>
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Mi Perfil</h1>

            {/* IDENTITY SECTION (Read-Only) */}
            <div className="glass-card" style={{ marginBottom: '20px', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass)', margin: '0 auto 15px', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="var(--text-secondary)" />}
                </div>
                {user.role === 'admin' && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--glass)', borderRadius: '50%', padding: '5px' }}>
                        <Lock size={12} color="#eab308" />
                    </div>
                )}

                <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>{user.name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '10px' }}>
                        {user.role === 'admin' ? 'Administrador' :
                            user.role === 'dirigente' ? 'Dirigente' :
                                user.role === 'veedor' || user.role === 'official' ? 'Veedor' :
                                    user.role === 'player' ? 'Jugador' : 'Fan'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span>{user.teamName || 'Sin Equipo'}</span>
                        {user.number && (
                            <>
                                <span>•</span>
                                <span>{user.number ? `#${user.number}` : 'N/A'}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* SPORTING DATA (Read-Only) */}
            {user.role === 'player' && (
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <SectionTitle icon={Trophy} title="Estadísticas de Temporada" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--secondary)' }}>{user.stats?.goals || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Goles</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{user.stats?.redCards || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Expulsiones</div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDITABLE PERSONAL INFO */}
            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <SectionTitle icon={user.role === 'admin' ? Lock : Edit3} title="Información Personal" />
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Editar</button>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Apodo / Alias</label>
                        {isEditing ? (
                            <input
                                type="text" value={formData.nickname}
                                onChange={(e) => handleChange('nickname', e.target.value)}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                            />
                        ) : (
                            <div style={{ fontWeight: '500' }}>{formData.nickname || 'No especificado'}</div>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ocupación</label>
                        {isEditing ? (
                            <input
                                type="text" value={formData.job}
                                onChange={(e) => handleChange('job', e.target.value)}
                                placeholder="Ej: Abogado, Estudiante"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                            />
                        ) : (
                            <div style={{ fontWeight: '500' }}>{formData.job || 'No especificado'}</div>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Bio / Frase ({formData.bio.length}/120)</label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                style={{ width: '100%', height: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px', resize: 'none' }}
                            />
                        ) : (
                            <div style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.8 }}>"{formData.bio || 'Sin biografía...'}"</div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTACT INFO */}
            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <SectionTitle icon={Phone} title="Contacto (Opcional)" />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    Si completas estos datos, serán visibles para otros jugadores. Déjalos en blanco para mantenerlos privados.
                </p>

                <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Instagram</label>
                        {isEditing ? (
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-secondary)' }}>@</span>
                                <input
                                    type="text" value={formData.instagram.replace('@', '')}
                                    onChange={(e) => handleChange('instagram', e.target.value)}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px 8px 8px 25px', color: 'white', borderRadius: '6px' }}
                                />
                            </div>
                        ) : (
                            <div style={{ fontWeight: '500', color: formData.instagram ? 'var(--primary)' : 'inherit' }}>{formData.instagram ? `@${formData.instagram.replace('@', '')}` : '-'}</div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Email</label>
                        {isEditing ? (
                            <input
                                type="email" value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                            />
                        ) : (
                            <div>{formData.email || '-'}</div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Teléfono (Contacto Principal)</label>
                        {isEditing ? (
                            <input
                                type="tel" value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Ej: +593 ..."
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                            />
                        ) : (
                            <div style={{ fontWeight: '500' }}>{formData.phone || '-'}</div>
                        )}
                    </div>
                </div>

            </div>

            {/* Actions */}
            {isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    {saveError && (
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '12px', textAlign: 'center' }}>
                            Error: {saveError}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button disabled={isSaving} onClick={() => { setIsEditing(false); setFormData({ ...user }); setSaveError(null); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: isSaving ? 0.5 : 1 }}>Cancelar</button>
                        <button disabled={isSaving} onClick={handleSave} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {isSaving ? <Loader size={16} className="spin" /> : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fade-in" style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    ¡Perfil Actualizado!
                </div>
            )}

            <div className="glass-card" style={{ marginTop: '30px' }}>
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
        </div>
    );
};

export default UserProfileView;
