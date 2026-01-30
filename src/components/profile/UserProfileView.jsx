import React, { useState } from 'react';
import { User, Lock, Edit3, Trophy, Phone, Mail, LogOut, Instagram, Gift, ChevronRight, ChevronLeft, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfileView = ({ user, onUpdateUser, onLogout }) => {
    const navigate = useNavigate();
    // Local state for editable fields
    const [formData, setFormData] = useState({
        nickname: user.nickname || '',
        job: user.job || '',
        bio: user.bio || '',
        footedness: user.footedness || 'Derecho',
        phone: user.phone || '',
        email: user.email || '',
        instagram: user.instagram || '',
        is_networker: user.is_networker || false,
        network_keywords: user.network_keywords || '',
        pref_contact: user.pref_contact || 'whatsapp',
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

            {/* CLUB DELTA PROMO BANNER */}
            <div
                onClick={() => navigate('/benefits')}
                className="glass-card"
                style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(255, 184, 0, 0.05) 100%)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 184, 0, 0.3)'
                    }}>
                        <Gift color="white" size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>CLUB DELTA</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Ver beneficios exclusivos</p>
                    </div>
                </div>
                <ChevronRight size={20} color="var(--primary)" />
            </div>

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
            {
                user.role === 'player' && (
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
                )
            }

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

            {/* NETWORKING SECTION */}
            <div className="glass-card" style={{
                marginBottom: '20px',
                border: formData.is_networker ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color={formData.is_networker ? 'var(--primary)' : 'var(--text-secondary)'} />
                        <h3 style={{ fontSize: '14px', color: formData.is_networker ? 'var(--primary)' : 'white', margin: 0 }}>Comunidad Copa Delta</h3>
                    </div>
                    {isEditing && (
                        <div
                            onClick={() => handleChange('is_networker', !formData.is_networker)}
                            style={{
                                width: '40px',
                                height: '20px',
                                background: formData.is_networker ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                position: 'relative',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{
                                width: '14px',
                                height: '14px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: formData.is_networker ? '22px' : '2px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        </div>
                    )}
                </div>

                {!formData.is_networker && !isEditing ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                        Activa el Networking para que otros miembros puedan encontrarte por tu actividad profesional.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '15px', opacity: formData.is_networker ? 1 : 0.5 }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            Al activar esta opción, permites que otros jugadores y dirigentes te encuentren por tus servicios profesionales.
                        </p>

                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Especialidad / Palabras Clave</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.network_keywords}
                                    onChange={(e) => handleChange('network_keywords', e.target.value)}
                                    placeholder="Ej: Paneles Solares, Abogado, Marketing"
                                    disabled={!formData.is_networker}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                                />
                            ) : (
                                <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{formData.network_keywords || 'No especificado'}</div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Contacto Preferido</label>
                            {isEditing ? (
                                <select
                                    value={formData.pref_contact}
                                    onChange={(e) => handleChange('pref_contact', e.target.value)}
                                    disabled={!formData.is_networker}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '6px' }}
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                    <option value="instagram">Instagram</option>
                                </select>
                            ) : (
                                <div style={{ textTransform: 'capitalize' }}>{formData.pref_contact || 'whatsapp'}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {
                isEditing && (
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
                )
            }

            {
                showSuccess && (
                    <div className="fade-in" style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        ¡Perfil Actualizado!
                    </div>
                )
            }

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
        </div >
    );
};

export default UserProfileView;
