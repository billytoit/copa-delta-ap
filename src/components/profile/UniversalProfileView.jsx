import React from 'react';
import { ChevronLeft, ShieldCheck, Edit3, Lock, Shield, MessageCircle, Users, Instagram, Mail, Phone, AlertCircle } from 'lucide-react';
import PlayerAvatar from '../shared/PlayerAvatar.jsx';

const UniversalProfileView = ({ profileId, onBack, user, teams, officials = [], teamStaff = [], onEdit }) => {
    // 1. Find the person (player, official or team staff)
    let person = null;
    let personTeam = null;
    let isOfficial = false;
    let isTeamStaff = false;

    if (!teams) return null;

    // Search in players
    for (const t of teams) {
        const found = (t.players || []).find(p => String(p.id) === String(profileId));
        if (found) {
            person = found;
            personTeam = t;
            break;
        }
    }

    // Search in officials if not found
    if (!person) {
        const foundOff = (officials || []).find(o => String(o.id) === String(profileId));
        if (foundOff) {
            person = foundOff;
            isOfficial = true;
        }
    }

    // Search in team staff if not found
    if (!person) {
        const foundStaff = (teamStaff || []).find(s => String(s.profile_id || s.id) === String(profileId));
        if (foundStaff) {
            person = foundStaff;
            personTeam = foundStaff.team;
            isTeamStaff = true;
        }
    }

    if (!person) return <div className="fade-in" style={{ padding: '20px', textAlign: 'center' }}>Perfil no encontrado. <button onClick={onBack}>Volver</button></div>;

    // 2. Mock Stats (if not present in player object)
    const stats = person.stats || { goals: 0, redCards: 0, yellowCards: 0, matches: 0 };

    const isOperador = user.role === 'operador' && personTeam && user.teamId === personTeam.id;
    const isAdmin = user.role === 'admin';
    const isVerified = person.status === 'Verificado';
    const canEdit = isAdmin || (isOperador && !isVerified);

    return (
        <div className="fade-in" style={{ paddingBottom: '50px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Status Badge */}
                {isVerified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid #22c55e' }}>
                        <ShieldCheck size={14} color="#22c55e" />
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#22c55e', textTransform: 'uppercase' }}>Verificado</span>
                    </div>
                )}

                {/* Admin/Operator Actions */}
                {canEdit && (
                    <button
                        onClick={() => onEdit(person.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                    >
                        <Edit3 size={16} /> Editar
                    </button>
                )}

                {!isAdmin && isOperador && isVerified && (
                    <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Lock size={14} /> Jugador Verificado. Edición bloqueada.
                    </div>
                )}
            </div>

            {/* HERO CARD (Dark Tone) */}
            <div className="glass-card" style={{
                textAlign: 'center',
                padding: '30px 20px',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 1) 100%)', // Darker background
                border: '1px solid var(--glass-border)',
                marginBottom: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Team Shield Decoration */}
                {personTeam && (
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                        <Shield size={180} color={personTeam.color} />
                    </div>
                )}

                {/* Avatar */}
                <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 15px',
                    borderRadius: '50%',
                    border: `3px solid ${personTeam ? personTeam.color : 'var(--primary)'}`,
                    padding: '3px', // Gap between border and image
                }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--glass)' }}>
                        <PlayerAvatar photo={person.photo_url} name={person.name} size={90} borderColor="transparent" />
                    </div>
                </div>

                {/* Name & Nickname */}
                <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px', color: 'white' }}>
                    {person.nickname ? person.nickname.toUpperCase() : person.name.split(' ')[0].toUpperCase()}
                </h1>
                <h2 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '20px' }}>
                    {person.name}
                </h2>

                {/* Role Badge */}
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {isOfficial ? 'OFICIAL DEL TORNEO' : isTeamStaff ? 'DIRIGENTE DE EQUIPO' : 'JUGADOR OFICIAL'}
                    </span>
                </div>

                {/* Team Info */}
                {personTeam && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Shield size={16} color={personTeam.color} />
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: personTeam.color }}>{personTeam.name}</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)', marginLeft: '5px' }}>#{person.number}</span>
                    </div>
                )}
            </div>

            {/* STATS GRID (Only for players) */}
            {!isOfficial && (
                <div className="glass-card" style={{ padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Goles</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{stats.goals}</div>
                        </div>
                    </div>
                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Torneo</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Copa Delta 2026</span>
                    </div>
                </div>
            )}

            {/* BIO & INFO (Always visible with placeholders) */}
            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                        <MessageCircle size={14} color="var(--primary)" />
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>BIO</span>
                    </div>
                    <p style={{ fontSize: '14px', fontStyle: 'italic', opacity: person.bio ? 0.9 : 0.5, lineHeight: '1.4' }}>
                        "{person.bio || "Información no disponible. El perfil aún no ha agregado una descripción personalizada."}"
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}>
                        <Users size={14} color="var(--text-secondary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Ocupación</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', opacity: person.job ? 1 : 0.5 }}>{person.job || "No especificada"}</div>
                    </div>
                </div>
            </div>

            {/* PUBLIC CONTACT (Placeholder if empty) */}
            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase' }}>Contacto</h3>
                {(person.instagram || person.email || person.phone) ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {person.instagram && (
                            <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Instagram size={18} color="#e1306c" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>@{person.instagram.replace('@', '')}</span>
                            </a>
                        )}
                        {person.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Mail size={18} color="var(--secondary)" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{person.email}</span>
                            </div>
                        )}
                        {person.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Phone size={18} color="#22c55e" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{person.phone}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '10px', opacity: 0.5, fontSize: '12px', fontStyle: 'italic' }}>
                        <Lock size={16} style={{ display: 'block', margin: '0 auto 5px', opacity: 0.7 }} />
                        Información de contacto privada
                    </div>
                )}
            </div>

            {/* FOOTER ACTION */}
            <div style={{ marginTop: '30px' }}>
                <button style={{ width: '100%', padding: '15px', background: 'none', border: '1px dashed var(--text-secondary)', borderRadius: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: '12px' }}>¿Algún dato es incorrecto? Reportar error</span>
                </button>
            </div>

        </div>
    );
};

export default UniversalProfileView;
