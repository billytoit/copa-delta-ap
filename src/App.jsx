import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Home, Calendar, Trophy, Users, LogOut, Edit3, FileText, Download, Shield, ChevronLeft, Settings, X, MessageCircle, AlertCircle, User, Check, Vote, Phone, Lock, Mail, Instagram, ShieldCheck } from 'lucide-react';
import Login from './Login.jsx';
import MatchTimer from './MatchTimer.jsx';
import { TEAMS_2026, GROUPS, TOP_SCORERS_2026, SOCIAL_MESSAGES, REFEREES_2026, OFFICIALS_2026, MATCHES_2026, LIBRES_2026 } from './data.js';
import { getActiveSeason, getTeams, getMatches, getTopScorers, createMatchEvent, deleteMatchEvent, updateMatchStatus, getReferees, startMatch, updatePlayer, updateOfficial, getOfficials, getPolls, createPoll, votePoll, closePoll, getUserParticipations } from './services/database.js';
import './index.css';

const IS_DEMO_MODE = true;

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

const SocialBanner = () => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % SOCIAL_MESSAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="glass-card" style={{
            marginBottom: 'var(--spacing-md)',
            padding: '12px 20px',
            borderLeft: '4px solid var(--primary)',
            background: 'linear-gradient(90deg, rgba(var(--primary-rgb), 0.1), transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minHeight: '60px'
        }}>
            <MessageCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
            <p className="fade-in" key={currentIdx} style={{
                fontSize: '13px',
                fontWeight: '500',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: '1.4'
            }}>
                {SOCIAL_MESSAGES[currentIdx]}
            </p>
        </div>
    );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '5px 0',
            flex: 1
        }}
    >
        <Icon size={24} style={{ marginBottom: '4px', opacity: active ? 1 : 0.6 }} />
        <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>{label}</span>
        {active && <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', marginTop: '4px' }} />}
    </button>
);

const PlayerAvatar = ({ photo, name, size = 60, borderSize = 2, borderColor = 'var(--primary)' }) => {
    const photoSrc = photo; // This can be photo_url or data URL from upload
    if (photoSrc) {
        return (
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `${borderSize}px solid ${borderColor}`,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--glass)'
            }}>
                <img src={photoSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: `${borderSize}px solid ${borderColor}`,
            background: 'var(--glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: `${size / 2.5}px`,
            fontWeight: 'bold',
            color: borderColor
        }}>
            {initials}
        </div>
    );
};

const UniversalProfileView_OLD = ({ profileId, onBack, user, onEdit }) => {
    // Buscar en Jugadores, Árbitros o Veedores
    let person = null;
    let team = null;
    let type = 'jugador';

    // 1. Buscar en Jugadores
    for (const t of TEAMS_2026) {
        const found = t.players.find(p => p.id == profileId);
        if (found) {
            person = found;
            team = t;
            type = 'jugador';
            break;
        }
    }

    // 2. Buscar en Árbitros
    if (!person) {
        const foundRef = (typeof REFEREES_2026 !== 'undefined' ? REFEREES_2026 : []).find(r => r.id == profileId);
        if (foundRef) {
            person = foundRef;
            type = 'arbitro';
        }
    }

    // 3. Buscar en Veedores
    if (!person) {
        const foundOff = (typeof OFFICIALS_2026 !== 'undefined' ? OFFICIALS_2026 : []).find(o => o.id == profileId);
        if (foundOff) {
            person = foundOff;
            type = 'veedor';
        }
    }

    if (!person) return null;

    const isOperador = user.role === 'operador' && team && user.teamId === team.id;
    const isAdmin = user.role === 'admin';
    const canEdit = isAdmin || isOperador;

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportText, setReportText] = useState('');

    const handleReportSubmit = () => {
        if (!reportText.trim()) return;
        alert('Reporte enviado correctamente. El administrador revisará la información.'); // Simulate API call
        setShowReportModal(false);
        setReportText('');
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '20px' }}>
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', fontSize: '14px' }}
            >
                <ChevronLeft size={18} />
                Volver
            </button>

            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 'var(--spacing-lg)', position: 'relative', overflow: 'hidden' }}>
                {team && (
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.05 }}>
                        <Shield size={180} color={team.color} />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                    <PlayerAvatar photo={person.photo} name={person.name} size={140} borderSize={5} borderColor={team ? team.color : 'var(--secondary)'} />
                </div>

                <h1 className="title-gradient" style={{ fontSize: '32px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {type === 'jugador' ? (person.nickname || person.name) : person.name}
                </h1>

                {type === 'jugador' && person.nickname && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '15px', fontWeight: '500' }}>
                        {person.name}
                    </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>
                    {type === 'jugador' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '15px' }}>
                                <Shield size={16} color={team.color} />
                                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{team.name}</span>
                            </div>
                            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px' }}>#{person.number}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '15px' }}>
                            <User size={16} color="var(--primary)" />
                            <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{person.role}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', marginBottom: 'var(--spacing-lg)' }}>
                {type === 'jugador' ? (
                    <>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Posición</span>
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{person.position}</span>
                        </div>
                        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Torneo</span>
                            <span style={{ fontWeight: '600' }}>Copa Delta 2026</span>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} /> Participación en el Torneo
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(person.history || []).map((matchId, idx) => (
                                <div key={idx} style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Partido #{matchId}</span>
                                    <span style={{
                                        color: type === 'arbitro' ? 'var(--secondary)' : 'var(--primary)',
                                        fontWeight: '700',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>{type === 'arbitro' ? 'Arbitraje' : 'Supervisión'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {canEdit && type === 'jugador' && (
                <div className="glass-card" style={{ marginBottom: 'var(--spacing-lg)', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), transparent)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={16} /> Panel de Gestión ({user.role === 'admin' ? 'Admin' : 'Operador'})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => onEdit(person.id)}
                            style={{
                                width: '100%',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <Edit3 size={16} />
                            Editar Identidad y Datos
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowReportModal(true)}
                style={{
                    width: '100%',
                    background: 'none',
                    border: '1px dashed var(--glass-border)',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    cursor: 'pointer'
                }}
            >
                <AlertCircle size={14} />
                ¿Algún dato es incorrecto? Reportar error
            </button>

            {showReportModal && (
                <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '350px' }}>
                        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} color="var(--primary)" /> Reportar Error
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            Describe qué información es incorrecta para que podamos corregirla.
                        </p>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Ej: Mi apellido está mal escrito, debería ser..."
                            style={{ width: '100%', height: '100px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '10px', marginBottom: '15px', fontSize: '13px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowReportModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleReportSubmit} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = ({ user, teams, officials = [], onUpdatePlayer, onSelectPlayer, onAddPlayer, onUpdateTeam }) => {
    const [tab, setTab] = useState('home');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
    const [viewTeamId, setViewTeamId] = useState(null);

    const allPlayers = teams.flatMap(t => (t.players || []).map(p => ({ ...p, teamName: t.name, teamColor: t.color, teamId: t.id })));
    const totalPlayers = allPlayers.length;

    const filteredPlayers = allPlayers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Panel de Control</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['home', 'players', 'teams', 'officials', 'users'].map(t => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setViewTeamId(null); }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: tab === t ? 'var(--primary)' : 'var(--glass)',
                            border: '1px solid var(--glass-border)',
                            color: tab === t ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {t === 'home' ? 'Inicio' : t === 'players' ? 'Jugadores' : t === 'teams' ? 'Equipos' : t === 'officials' ? 'Oficiales' : 'Usuarios'}
                    </button>
                ))}
            </div>

            {tab === 'home' && (
                <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <Users size={30} color="var(--primary)" style={{ marginBottom: '10px' }} />
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Jugadores</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalPlayers}</div>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <Shield size={30} color="var(--secondary)" style={{ marginBottom: '10px' }} />
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Equipos</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{teams.length}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setTab('players')}
                        style={{ width: '100%', padding: '15px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <Edit3 size={20} /> Gestionar Jugadores
                    </button>
                </div>
            )}

            {tab === 'players' && (
                <div className="fade-in">
                    {selectedPlayerForEdit ? (
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3>Editar Jugador</h3>
                                <button onClick={() => setSelectedPlayerForEdit(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <EditPlayerForm
                                player={selectedPlayerForEdit}
                                existingPlayers={allPlayers.filter(p => p.teamId === selectedPlayerForEdit.teamId)}
                                user={user}
                                onCancel={() => setSelectedPlayerForEdit(null)}
                                onSave={(newData) => {
                                    onUpdatePlayer({ ...selectedPlayerForEdit, ...newData });
                                    setSelectedPlayerForEdit(null);
                                }}
                            />
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                {/* Status selection moved inside form */}
                            </div>
                        </div>

                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ flex: 1, padding: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div className="glass-card" style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
                                {filteredPlayers.map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', gap: '10px' }}>
                                        <PlayerAvatar photo={p.photo_url} name={p.name} size={40} borderColor={p.teamColor} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.nickname || p.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.teamName}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div onClick={() => setSelectedPlayerForEdit(p)} style={{ color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                    }
                </div >
            )
            }

            {
                tab === 'teams' && (
                    <div className="fade-in">
                        {viewTeamId ? (
                            <div>
                                <button
                                    onClick={() => setViewTeamId(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    <ChevronLeft size={18} />
                                    Volver a Equipos
                                </button>
                                <TeamManager user={user} teamId={viewTeamId} teams={teams} onSelectPlayer={(pid) => { if (onSelectPlayer) onSelectPlayer(pid); }} onAddPlayer={onAddPlayer} onUpdateTeam={onUpdateTeam} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {teams.map(t => (
                                    <div
                                        key={t.id}
                                        className="glass-card"
                                        onClick={() => setViewTeamId(t.id)}
                                        style={{ padding: '15px', textAlign: 'center', borderTop: `3px solid ${t.color}`, cursor: 'pointer' }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(t.players || []).length} jugadores</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                tab === 'users' && (
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '15px', fontSize: '14px' }}>Usuarios y Permisos (Solo Lectura)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>admin@delta.com</div>
                                    <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Administrador</div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#22c55e' }}>Activo</div>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>operador@atletico.com</div>
                                    <div style={{ fontSize: '11px', color: 'var(--secondary)' }}>Operador (Atlético)</div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#22c55e' }}>Activo</div>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>veedor@delta.com</div>
                                    <div style={{ fontSize: '11px', color: '#ec4899' }}>Veedor</div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#22c55e' }}>Activo</div>
                            </div>
                        </div>
                    </div>
                )
            }
            {tab === 'officials' && (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
                        {officials.length > 0 ? officials.map(o => (
                            <div key={o.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', gap: '10px' }}>
                                <PlayerAvatar photo={o.photo_url} name={o.name} size={40} borderColor="var(--primary)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{o.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Veedor / Árbitro</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div onClick={() => onSelectPlayer(o.id)} style={{ color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Ver Perfil</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No hay oficiales registrados.</div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
};

const EditPlayerForm = ({ player, existingPlayers = [], onSave, onCancel, user }) => {
    const isAdmin = user?.role === 'admin';
    const isLocked = player.status === 'Verificado' && !isAdmin;

    const [formData, setFormData] = useState({
        name: player.name,
        nickname: player.nickname || '',
        number: player.number || '',
        phone: player.phone || '',
        photo_url: player.photo_url
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setError('');

        if (formData.number) {
            const newNumber = parseInt(formData.number);
            const duplicate = (existingPlayers || []).find(p => p.number === newNumber && p.id !== player.id);

            if (duplicate) {
                setError(`El número ${newNumber} ya está en uso por ${duplicate.nickname || duplicate.name}`);
                return;
            }
        }

        if (isLocked) return;

        try {
            setIsSaving(true);
            await onSave(formData);
        } catch (err) {
            setError(err.message || 'Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-card fade-in" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--primary)" /> Editar Perfil
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <PlayerAvatar photo={formData.photo_url} name={formData.name} size={100} />
                        <label
                            htmlFor="photo-upload"
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: 'var(--primary)',
                                padding: '8px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #0f172a'
                            }}
                        >
                            <Edit3 size={16} color="white" />
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData({ ...formData, photo_url: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre Legal</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isLocked}
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Apodo (Alias)</label>
                    <input
                        type="text"
                        maxLength={20}
                        placeholder="Ej: Billy"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        disabled={isLocked}
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Número #</label>
                    <input
                        type="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        disabled={isLocked}
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Teléfono (Contacto Principal)</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={isLocked}
                        placeholder="Ej: +593 ..."
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text' }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <button onClick={onCancel} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>{isLocked ? 'Cerrar' : 'Cancelar'}</button>
                    {!isLocked && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                padding: '12px',
                                background: isSaving ? 'var(--text-secondary)' : 'var(--primary)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: isSaving ? 'wait' : 'pointer',
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    )}
                </div>
                {isLocked && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>Jugador Verificado. Edición bloqueada.</p>}
                {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
            </div>
        </div>
    );
};

const TeamManager = ({ user, teamId, onSelectPlayer, teams, onAddPlayer, onUpdateTeam }) => {
    const team = teams.find(t => t.id === teamId) || { players: [] };
    const [showAddForm, setShowAddForm] = useState(false);

    if (!team) return null;

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (onUpdateTeam) {
                    onUpdateTeam({ ...team, photo: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (showAddForm) {
        return (
            <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Agregar Jugador a {team.name}</h3>
                    <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <EditPlayerForm
                    player={{ name: '', nickname: '', number: '', photo_url: null, teamId: team.id }}
                    existingPlayers={team.players}
                    user={user}
                    onCancel={() => setShowAddForm(false)}
                    onSave={(newData) => {
                        onAddPlayer({ ...newData, teamId: team.id });
                        setShowAddForm(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Gestión de Equipo</h1>

            <div className="glass-card" style={{ marginBottom: '20px', padding: '0', overflow: 'hidden', position: 'relative' }}>
                {team.photo ? (
                    <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                        <img src={team.photo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '15px', paddingTop: '40px' }}>
                            <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{team.name}</h2>
                            <p style={{ fontSize: '12px', color: 'white', opacity: 0.8 }}>Operador: {user.name}</p>
                        </div>
                        <label style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <Edit3 size={16} color="white" />
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', border: `2px solid ${team.color}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'var(--glass)',
                            borderRadius: '50%',
                            margin: '0 auto 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${team.color}`,
                            position: 'relative'
                        }}>
                            <Shield size={30} color={team.color} />
                        </div>
                        <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{team.name}</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Operador: {user.name}</p>
                        <div style={{ marginTop: '15px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                <Edit3 size={14} /> Subir Foto de Equipo
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '16px' }}>Plantilla ({team.players.length})</h3>
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        + Agregar
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {team.players.map(p => (
                        <div key={p.id} onClick={() => onSelectPlayer(p.id)} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                            <PlayerAvatar photo={p.photo_url} name={p.name} size={40} borderColor={team.color} />
                            <div style={{ marginLeft: '12px', flex: 1 }}>
                                <div style={{ fontWeight: '800', fontSize: '14px' }}>
                                    {p.nickname ? `${p.nickname} (${p.name})` : p.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>#{p.number}</div>
                            </div>
                            <Edit3 size={16} color="var(--primary)" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};



const GoleadoresWidget = ({ onSelectPlayer, teams, scorers = [] }) => {
    // Si no hay goleadores aún, mostrar estado vacío
    if (!scorers || scorers.length === 0) {
        return (
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-md)', padding: '20px', textAlign: 'center' }}>
                <Trophy size={18} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Aún no hay goles registrados en esta temporada.
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--secondary)" /> Goleadores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scorers.slice(0, 10).map((scorer, idx) => (
                    <div
                        key={scorer.id}
                        onClick={() => onSelectPlayer(scorer.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: idx < scorers.slice(0, 10).length - 1 ? '1px solid var(--glass-border)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '15px' }}>{idx + 1}</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800' }}>{scorer.nickname || scorer.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shield size={10} color={scorer.teamColor} /> {scorer.teamName}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '16px' }}>{scorer.goals}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TeamsView = ({ teams, officials = [], onSelectPlayer, user, onUpdateTeam }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    const playerResults = searchTerm ? teams.flatMap(t => (t.players || []).map(p => ({ ...p, teamColor: t.color, teamName: t.name, type: 'player' }))).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    const officialResults = searchTerm ? officials.map(o => ({ ...o, teamName: 'Oficial del Torneo', teamColor: 'var(--primary)', type: 'official' })).filter(o =>
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.nickname && o.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    const searchResults = [...playerResults, ...officialResults];

    const selectedTeam = selectedTeamId ? teams.find(t => t.id === selectedTeamId) : null;

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (onUpdateTeam && selectedTeam) {
                    onUpdateTeam({ ...selectedTeam, photo: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fade-in">
            {!selectedTeamId ? (
                <>
                    <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Equipos 2026</h1>

                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar jugador por nombre o apodo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 15px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', fontSize: '14px' }}
                        />
                        {searchTerm && <X size={18} style={{ position: 'absolute', right: '12px', top: '12px', opacity: 0.5, cursor: 'pointer' }} onClick={() => setSearchTerm('')} />}
                    </div>

                    {searchTerm ? (
                        <div className="glass-card" style={{ padding: '0' }}>
                            <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Resultados de búsqueda ({searchResults.length})
                            </div>
                            {searchResults.map((p, idx) => (
                                <div
                                    key={p.id}
                                    onClick={() => onSelectPlayer(p.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 15px',
                                        borderBottom: idx < searchResults.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <PlayerAvatar photo={p.photo_url} name={p.name} size={35} borderColor={p.teamColor} />
                                    <div style={{ marginLeft: '12px', flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '14px' }}>
                                            {p.nickname ? `${p.nickname} (${p.name})` : p.name}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{p.type === 'official' ? 'Oficial' : p.teamName}</div>
                                    </div>
                                    {p.number && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>#{p.number}</span>}
                                </div>
                            ))}
                            {searchResults.length === 0 && <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No se encontró ningún jugador.</div>}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            {teams.map(team => (
                                <div
                                    key={team.id}
                                    onClick={() => setSelectedTeamId(team.id)}
                                    className="glass-card"
                                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-md)' }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--glass)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `2px solid ${team.color || 'var(--glass-border)'}`
                                    }}>
                                        <Shield size={32} color={team.color || 'var(--text-secondary)'} />
                                    </div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{team.name}</h3>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ver Plantilla</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="fade-in">
                    <button
                        onClick={() => setSelectedTeamId(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', fontSize: '14px' }}
                    >
                        <ChevronLeft size={18} />
                        Volver al listado
                    </button>

                    <div className="glass-card" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', padding: '0', overflow: 'hidden', position: 'relative' }}>
                        {selectedTeam.photo ? (
                            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                                <img src={selectedTeam.photo} alt={selectedTeam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', paddingTop: '60px' }}>
                                    <h1 className="title-gradient" style={{ fontSize: '24px', marginBottom: '5px' }}>{selectedTeam.name}</h1>
                                    <p style={{ color: 'white', fontSize: '14px', opacity: 0.9 }}>Plantilla Oficial</p>
                                </div>
                                {((user?.role === 'admin') || (user?.role === 'operador')) && (
                                    <label style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                        <Edit3 size={16} color="white" />
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                    </label>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: 'var(--spacing-xl)' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--glass)',
                                    borderRadius: '50%',
                                    margin: '0 auto 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `3px solid ${selectedTeam.color}`,
                                    position: 'relative'
                                }}>
                                    <Shield size={40} color={selectedTeam.color} />
                                </div>
                                <h1 className="title-gradient" style={{ fontSize: '24px', marginBottom: '8px' }}>{selectedTeam.name}</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Plantilla Oficial</p>
                                {((user?.role === 'admin') || (user?.role === 'operador')) && (
                                    <div style={{ marginTop: '15px' }}>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            <Edit3 size={14} /> Subir Foto de Equipo
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <h3 style={{ fontSize: '16px', marginBottom: '15px', paddingLeft: '5px' }}>Lista de Jugadores {(selectedTeam.players || []).length}</h3>
                    <div className="glass-card" style={{ padding: '0' }}>
                        {(selectedTeam.players || []).map((p, idx) => (
                            <div
                                key={p.id}
                                onClick={() => onSelectPlayer(p.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    borderBottom: idx < selectedTeam.players.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <PlayerAvatar photo={p.photo_url} name={p.name} size={35} borderColor={selectedTeam.color} />
                                <div style={{ marginLeft: '12px', flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '14px' }}>
                                        {p.nickname ? `${p.nickname} (${p.name})` : p.name}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>#{p.number}</div>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>#{p.number}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const GlobalHeader = ({ user, onSettingsClick, onProfileClick }) => {
    const getRoleBadge = () => {
        if (!user) return null;
        const roleColors = {
            'admin': { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308', label: 'ADMIN' },
            'official': { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'VEEDOR' },
            'operator': { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', label: 'OPERADOR' },
            'player': { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', label: 'JUGADOR' }
        };
        const config = roleColors[user.role] || roleColors['player'];
        return (
            <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '6px',
                background: config.bg,
                color: config.color,
                letterSpacing: '1px',
                border: `1px solid ${config.color}`,
                marginRight: '10px'
            }}>
                {config.label}
            </span>
        );
    };

    return (
        <header className="fade-in" style={{ marginBottom: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <img src="/logo.png" alt="Copa Delta" style={{ height: '50px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getRoleBadge()}

                {/* Profile Access Button */}
                {user && (
                    <div
                        onClick={onProfileClick}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'var(--glass)',
                            border: '1px solid var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} color="white" />
                        )}
                    </div>
                )}

                <div
                    className="glass-card"
                    style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '38px', height: '38px' }}
                    onClick={onSettingsClick}
                >
                    <Settings size={18} color="var(--text-secondary)" />
                </div>
            </div>
        </header>
    );
};

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
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleSave = () => {
        // Simulate API update
        if (onUpdateUser) {
            onUpdateUser({ ...user, ...formData });
        }
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const SectionTitle = ({ icon: Icon, title }) => (
        <h3 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>
            <Icon size={16} /> {title}
        </h3>
    );

    const ReadOnlyField = ({ label, value }) => (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{value || '-'}</div>
        </div>
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>{user.teamName || 'Sin Equipo'}</span>
                    <span>•</span>
                    <span>{user.number ? `#${user.number}` : 'N/A'}</span>
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
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <button onClick={() => { setIsEditing(false); setFormData({ ...user }); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={handleSave} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
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

const UniversalProfileView = ({ profileId, onBack, user, teams, officials = [], onEdit }) => {
    // 1. Find the person (player or official)
    let person = null;
    let personTeam = null;
    let isOfficial = false;

    if (!teams) return null;

    // Search in players
    for (const t of teams) {
        const found = (t.players || []).find(p => p.id === profileId);
        if (found) {
            person = found;
            personTeam = t;
            break;
        }
    }

    // Search in officials if not found
    if (!person) {
        const foundOff = officials.find(o => o.id === profileId);
        if (foundOff) {
            person = foundOff;
            isOfficial = true;
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
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                    <ChevronLeft size={24} /> Volver
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
                        {isOfficial ? 'OFICIAL DEL TORNEO' : 'JUGADOR OFICIAL'}
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

const HomePage = ({ user, onSelectPlayer, teams, officials = [], matches, topScorers = [], onUpdatePlayer, onAddPlayer, handleUpdateTeam, onSelectMatch }) => {
    // Find next match (first scheduled match)
    // Assuming matches are roughly sorted or just taking the first 'scheduled' one.
    const nextMatch = matches ? matches.find(m => (!m.status || m.status === 'scheduled')) : null;

    return (
        <div className="fade-in">
            {/* Header moved to App level */}

            {user.role === 'admin' ? (
                <AdminDashboard user={user} teams={teams} officials={officials} onUpdatePlayer={onUpdatePlayer} onSelectPlayer={onSelectPlayer} onAddPlayer={onAddPlayer} onUpdateTeam={handleUpdateTeam} />
            ) : user.role === 'operador' ? (
                <TeamManager user={user} teamId={user.teamId} onSelectPlayer={onSelectPlayer} teams={teams} onAddPlayer={onAddPlayer} onUpdateTeam={handleUpdateTeam} />
            ) : (
                <>




                    {/* Hide SocialBanner for Veedor */}
                    {user.role !== 'official' && <SocialBanner />}

                    {nextMatch && (
                        <div
                            className="glass-card"
                            style={{
                                marginBottom: 'var(--spacing-md)',
                                cursor: (user.role === 'official') ? 'pointer' : 'default',
                                transition: 'transform 0.2s',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                border: '1px solid var(--primary)'
                            }}
                            onClick={() => {
                                if (user.role === 'official' && onSelectMatch) {
                                    onSelectMatch(nextMatch.id);
                                }
                            }}
                            onMouseEnter={(e) => {
                                if (user.role === 'official') e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                if (user.role === 'official') e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                <h2 style={{ fontSize: '14px', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {user.role === 'official' ? 'Tu Próximo Partido' : 'Próximo Partido'}
                                </h2>
                                {user.role === 'official' && <Edit3 size={14} color="var(--primary)" />}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                        <Shield size={24} color="#CB3524" /> {/* Placeholder color if no team color in match data */}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamA}</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '800', opacity: 0.5, padding: '0 10px' }}>VS</div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                        <Shield size={24} color="#034694" />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamB}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px' }}>
                                {nextMatch.date} - {nextMatch.time}
                            </div>
                        </div>
                    )}

                    <GoleadoresWidget onSelectPlayer={onSelectPlayer} teams={teams} scorers={topScorers} />
                </>
            )}
        </div>
    );
};

const VeedorMatchRegistration = ({ match, onBack, teams, onSaveResult, onStartMatch, onRefresh, user }) => {
    const [events, setEvents] = useState(() => {
        return (match.match_events || []).map(dbEv => {
            const isNote = dbEv.event_type === 'note';
            return {
                id: dbEv.id,
                type: isNote ? 'note' : (dbEv.event_type === 'goal' ? 'goal' : 'card'),
                color: dbEv.event_type === 'red_card' ? 'Roja' : (dbEv.event_type === 'yellow_card' ? 'Amarilla' : ''),
                player: dbEv.player || {},
                text: dbEv.note_text,
                timestamp: `${dbEv.event_minute || 0}'`
            };
        }).sort((a, b) => b.id - a.id); // Sort by ID to keep order if minutes are the same
    });
    const [note, setNote] = useState('');
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [goalTeamFilter, setGoalTeamFilter] = useState('all');
    const [cardTeamFilter, setCardTeamFilter] = useState('all');

    const matchTeams = teams.filter(t => t.name === match.teamA || t.name === match.teamB);
    const allPlayers = matchTeams.flatMap(t => (t.players || []).map(p => ({ ...p, teamName: t.name, teamId: t.id })));

    // Attendance State
    const [showAttendance, setShowAttendance] = useState(false);
    const [attendance, setAttendance] = useState(() => {
        // Pre-fill with all players? Or empty? Plan said "all checked" is usually better for "desmarcar ausentes".
        // Let's safe bet: Check all.
        return allPlayers.map(p => p.id);
    });

    const toggleAttendance = (playerId) => {
        setAttendance(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    };

    const addEvent = async (type, data, timeOverride) => {
        let finalData = { ...data };
        const timestamp = timeOverride || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Lógica de Doble Amarilla
        if (type === 'card' && data.color === 'Amarilla') {
            const hasYellow = events.some(e => e.type === 'card' && e.player.id === data.player.id && e.color === 'Amarilla');
            if (hasYellow) {
                finalData.color = 'Doble Amarilla';
            }
        }

        const newEvent = { id: Date.now(), type, ...finalData, timestamp };

        // Optimistic update
        setEvents(prev => [...prev, newEvent].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

        // Persist to Supabase if it's a goal, card or note
        if (type === 'goal' || type === 'card' || type === 'note') {
            try {
                const payload = {
                    match_id: match.id,
                    event_type: type === 'goal' ? 'goal' : (type === 'card' ? (finalData.color === 'Roja' ? 'red_card' : 'yellow_card') : 'note'),
                    event_minute: (() => {
                        // FIX: Calculate real match minute instead of parsing wall clock
                        console.log('[DEBUG PRE-INSERT] Payload check:', { timestamp, matchStartedAt: match.started_at });

                        // 1. Manual Entry (e.g. "45'")
                        if (typeof timestamp === 'string' && timestamp.includes("'")) {
                            return parseInt(timestamp) || 0;
                        }

                        // 2. Realtime Calculation (Elapsed Minutes)
                        if (match.started_at) {
                            const start = Number(match.started_at);
                            const now = Date.now();
                            const elapsedMs = now - start;
                            const minutes = Math.floor(elapsedMs / 60000);
                            return minutes > 0 ? minutes : 0;
                        }

                        return 0;
                    })()
                };

                if (type === 'note') {
                    payload.note_text = data.text;
                } else {
                    payload.player_id = data.player.id;
                    payload.team_id = data.player.teamId;
                }

                const result = await createMatchEvent(payload);

                if (result && result[0]) {
                    const realId = result[0].id;
                    setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, id: realId } : e));
                }

                if (type === 'goal' && onRefresh) {
                    await onRefresh(true);
                }
            } catch (err) {
                console.error("Error persisting event:", err);
            }
        }
    };

    const deleteEvent = async (id) => {
        try {
            // Un-optimistic check: did it actually delete?
            const success = await deleteMatchEvent(id);

            if (!success) {
                alert("No se pudo eliminar el evento de la base de datos. \n\nEsto suele ser por falta de permisos (RLS). \nPor favor ejecute el archivo 'allow_delete.sql' en su editor de Supabase.");
                return;
            }

            setEvents(prev => prev.filter(e => e.id !== id));
            // Trigger refresh without the "Cargando" screen
            await onRefresh(true);
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error al eliminar evento: " + error.message);
        }
    };

    // Time input state for manual override
    const [manualTime, setManualTime] = useState('');
    const [manualMinute, setManualMinute] = useState('');

    const [elapsedTime, setElapsedTime] = useState('00:00');

    // Timer Logic
    useEffect(() => {
        let interval;
        if (match.status === 'playing' && match.startedAt) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - match.startedAt) / 1000);
                const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
                const seconds = (diff % 60).toString().padStart(2, '0');
                setElapsedTime(`${minutes}:${seconds}`);
            }, 1000);
        } else {
            setElapsedTime('00:00');
        }
        return () => clearInterval(interval);
    }, [match.status, match.startedAt]);

    useEffect(() => {
        if (showGoalForm || showCardForm) {
            // Use Match Time (elapsedTime) instead of Clock Time
            setManualTime(elapsedTime);
        }
    }, [showGoalForm, showCardForm, elapsedTime]);


    // Referee Registration State
    const [refereeName, setRefereeName] = useState('');
    const [refereeError, setRefereeError] = useState('');
    const [startError, setStartError] = useState('');

    const confirmStartMatch = async () => {
        setStartError('');
        const name = refereeName.trim();
        if (name.length < 3) {
            setRefereeError('El nombre debe tener al menos 3 caracteres.');
            return;
        }

        try {
            console.log("Confirming start match with Name:", name);

            if (typeof onStartMatch !== 'function') {
                throw new Error("Internal Error: onStartMatch prop is missing");
            }

            await onStartMatch(match.id, {
                refereeName: name
            });

        } catch (err) {
            console.error("Error in confirmStartMatch:", err);
            setStartError("Error: " + (err.message || 'Error desconocido'));
        }
    };


    return (
        <div className="fade-in" style={{ paddingBottom: '30px' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer' }}>
                <ChevronLeft size={18} /> Volver a Partidos
            </button>

            <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PLANILLA DE CONTROL #{match.id}</span>
                    {match.status === 'playing' ? (
                        <div style={{ padding: '4px 10px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>
                            EN JUEGO • {elapsedTime}
                        </div>
                    ) : match.status === 'finished' ? (
                        <div style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
                            FINALIZADO
                        </div>
                    ) : (
                        <div style={{ padding: '4px 10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--text-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>
                            NO INICIADO
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{match.teamA}</div>
                    </div>
                    <div style={{ padding: '5px 15px', background: 'var(--primary)', borderRadius: '4px', fontWeight: '900', fontSize: '18px' }}>{match.score}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{match.teamB}</div>
                    </div>
                </div>

                {!match.status || match.status === 'scheduled' ? (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary)' }}>Iniciar Partido</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px' }}>Nombre del Árbitro *</label>
                            <input
                                type="text"
                                value={refereeName}
                                onChange={(e) => { setRefereeName(e.target.value); setRefereeError(''); }}
                                placeholder="Ej: Carlos Coll"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-color)', border: refereeError ? '1px solid #ef4444' : '1px solid var(--glass-border)', color: 'white' }}
                            />
                            {refereeError && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px' }}>{refereeError}</div>}
                        </div>
                        <button
                            type="button"
                            onClick={confirmStartMatch}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: refereeName.trim().length < 3 ? '#334155' : '#22c55e',
                                color: refereeName.trim().length < 3 ? '#94a3b8' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: refereeName.trim().length < 3 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                            disabled={refereeName.trim().length < 3}
                        >
                            Confirmar e Iniciar
                        </button>
                    </div>
                ) : null}

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <button
                    onClick={() => setShowGoalForm(true)}
                    disabled={match.status !== 'playing' && user.role !== 'admin'}
                    style={{
                        background: (match.status === 'playing' || user.role === 'admin') ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                        color: (match.status === 'playing' || user.role === 'admin') ? 'white' : 'rgba(255,255,255,0.2)',
                        border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                        cursor: (match.status === 'playing' || user.role === 'admin') ? 'pointer' : 'not-allowed'
                    }}
                >
                    <Trophy size={20} /> Registrar Gol
                </button>
                <button
                    onClick={() => setShowCardForm(true)}
                    disabled={match.status !== 'playing' && user.role !== 'admin'}
                    style={{
                        background: (match.status === 'playing' || user.role === 'admin') ? '#FFD700' : 'rgba(255,255,255,0.05)',
                        color: (match.status === 'playing' || user.role === 'admin') ? '#000' : 'rgba(255,255,255,0.2)',
                        border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                        cursor: (match.status === 'playing' || user.role === 'admin') ? 'pointer' : 'not-allowed'
                    }}
                >
                    <Shield size={20} /> Tarjetas
                </button>
            </div>

            {showGoalForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '20px', border: '1px solid var(--secondary)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>Autor del Gol</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Minuto (Opcional)</label>
                        <input
                            type="number"
                            placeholder="Ej: 45"
                            value={manualMinute}
                            onChange={(e) => setManualMinute(e.target.value)}
                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Hora del Evento</label>
                        <input
                            type="time"
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                        <button
                            onClick={() => setGoalTeamFilter('all')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === 'all' ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === 'all' ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setGoalTeamFilter(match.teamA)}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === match.teamA ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === match.teamA ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {match.teamA}
                        </button>
                        <button
                            onClick={() => setGoalTeamFilter(match.teamB)}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === match.teamB ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === match.teamB ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {match.teamB}
                        </button>
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {allPlayers
                            .filter(p => goalTeamFilter === 'all' || p.teamName === goalTeamFilter)
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(p => (
                                <div key={p.id} onClick={() => {
                                    const time = manualMinute ? `${manualMinute}'` : manualTime;
                                    addEvent('goal', { player: p }, time);
                                    setShowGoalForm(false);
                                    setGoalTeamFilter('all');
                                    setManualMinute('');
                                }} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{p.nickname || p.name} <span style={{ opacity: 0.5, fontSize: '10px' }}>({p.teamName})</span></span>
                                    </div>
                                    <span style={{ fontWeight: 'bold' }}>#{p.number}</span>
                                </div>
                            ))}
                    </div>
                    <button onClick={() => { setShowGoalForm(false); setGoalTeamFilter('all'); }} style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}>Cancelar</button>
                </div>
            )}

            {showCardForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '20px', border: '1px solid #FFD700' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>Sanción Disciplinaria</h3>

                    <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Minuto</label>
                            <input
                                type="number"
                                placeholder="Ej: 32"
                                value={manualMinute}
                                onChange={(e) => setManualMinute(e.target.value)}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Hora (Opcional)</label>
                            <input
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                        <button
                            onClick={() => setCardTeamFilter('all')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === 'all' ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === 'all' ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setCardTeamFilter(match.teamA)}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === match.teamA ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === match.teamA ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {match.teamA}
                        </button>
                        <button
                            onClick={() => setCardTeamFilter(match.teamB)}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === match.teamB ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === match.teamB ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {match.teamB}
                        </button>
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {allPlayers
                            .filter(p => cardTeamFilter === 'all' || p.teamName === cardTeamFilter)
                            .map(p => (
                                <div key={p.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{p.nickname || p.name}</span>
                                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{p.teamName} #{p.number}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                const time = manualMinute ? `${manualMinute}'` : manualTime;
                                                addEvent('card', { player: p, color: 'Amarilla' }, time);
                                                setShowCardForm(false);
                                                setCardTeamFilter('all');
                                                setManualMinute('');
                                            }}
                                            style={{ padding: '6px 12px', background: '#eab308', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                                        >
                                            Amarilla
                                        </button>
                                        <button
                                            onClick={() => {
                                                const time = manualMinute ? `${manualMinute}'` : manualTime;
                                                addEvent('card', { player: p, color: 'Roja' }, time);
                                                setShowCardForm(false);
                                                setCardTeamFilter('all');
                                                setManualMinute('');
                                            }}
                                            style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                                        >
                                            Roja
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <button onClick={() => { setShowCardForm(false); setCardTeamFilter('all'); }} style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}>Cancelar</button>
                </div>
            )}

            <div className="glass-card" style={{ marginBottom: '20px', opacity: (match.status === 'playing' || user.role === 'admin') ? 1 : 0.5, pointerEvents: (match.status === 'playing' || user.role === 'admin') ? 'auto' : 'none' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Notas de Eventualidades</h3>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={(match.status === 'playing' || user.role === 'admin') ? "Ej: Interrupción por lluvia, conducta del público..." : "Inicia el partido para agregar notas."}
                    style={{ width: '100%', height: '80px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '10px', fontSize: '13px' }}
                />
                <button
                    onClick={() => { if (note) { addEvent('note', { text: note }, elapsedTime); setNote(''); } }}
                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                >
                    Añadir Nota
                </button>
            </div>

            <div className="glass-card" style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-secondary)' }}>Registro del Partido</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events.map((ev, index) => {
                        const isTeamA = ev.type !== 'note' && (ev.player.teamName === match.teamA);
                        const isNote = ev.type === 'note';

                        // Notes are centered / full width
                        if (isNote) {
                            return (
                                <div key={ev.id} style={{
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    border: '1px dashed var(--glass-border)'
                                }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--primary)' }}>{ev.timestamp}</span>
                                    {ev.text}
                                </div>
                            );
                        }

                        // Event Cards
                        // Rules: Goal=White, Yellow=Yellow, Red=Red
                        const highlightColor = ev.type === 'goal' ? '#ffffff' :
                            (ev.color === 'Roja' || ev.color === 'Doble Amarilla') ? '#ef4444' : '#eab308';

                        const eventLabel = ev.type === 'goal' ? 'GOL' :
                            ev.color === 'Doble Amarilla' ? 'DOBLE AMARILLA' :
                                ev.color === 'Roja' ? 'TARJETA ROJA' : 'TARJETA AMARILLA';

                        return (
                            <div key={ev.id} style={{
                                alignSelf: isTeamA ? 'flex-start' : 'flex-end',
                                width: '90%',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid var(--glass-border)',
                                // Side-specific highlight logic
                                borderLeft: isTeamA ? `4px solid ${highlightColor}` : '1px solid var(--glass-border)',
                                borderRight: !isTeamA ? `4px solid ${highlightColor}` : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                padding: '12px',
                                // Padding adjustment based on highlight side
                                paddingLeft: isTeamA ? '16px' : '12px',
                                paddingRight: !isTeamA ? '16px' : '12px',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        letterSpacing: '0.5px',
                                        color: highlightColor,
                                        textTransform: 'uppercase',
                                        marginBottom: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {ev.type === 'goal' && <Trophy size={10} />}
                                        {ev.type === 'card' && <div style={{ width: '8px', height: '10px', background: highlightColor, borderRadius: '1px' }}></div>}
                                        {eventLabel}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                                        {ev.player.nickname || ev.player.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {ev.player.teamName} #{ev.player.number}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', opacity: 0.8 }}>
                                        {ev.timestamp.split(':').slice(0, 2).join(':')}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                                        style={{
                                            background: '#ef4444',
                                            border: 'none',
                                            borderRadius: '6px',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} color="white" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>
                            No hay eventos registrados.
                        </div>
                    )}
                </div>
            </div>

            {match.status === 'finished' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => onSaveResult(match.id, match.score, attendance)} // Re-save result
                            style={{ width: '100%', padding: '18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Edit3 size={18} /> ACTUALIZAR RESULTADO / MARCADOR
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (window.confirm('¿Reabrir planilla para correcciones?')) {
                                onStartMatch(match.id); // This will set status back to 'playing'
                            }
                        }}
                        style={{ width: '100%', padding: '18px', background: 'var(--glass)', color: 'white', border: '1px solid var(--text-secondary)', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <Edit3 size={18} /> HABILITAR EDICIÓN (REABRIR)
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowAttendance(true)}
                    disabled={!match.status || match.status === 'scheduled'}
                    style={{
                        width: '100%', marginTop: '20px', padding: '18px',
                        background: (!match.status || match.status === 'scheduled') ? 'var(--glass)' : 'var(--primary)',
                        color: (!match.status || match.status === 'scheduled') ? 'rgba(255,255,255,0.2)' : 'white',
                        border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '16px', cursor: (!match.status || match.status === 'scheduled') ? 'not-allowed' : 'pointer',
                        boxShadow: (!match.status || match.status === 'scheduled') ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.3)'
                    }}
                >
                    FINALIZAR PARTIDO Y TOMAR ASISTENCIA
                </button>
            )}

            {/* Attendance Modal / Overlay */}
            {showAttendance && (
                <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 100, padding: '20px', overflowY: 'auto' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Registro de Asistencia</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '13px' }}>
                        Marque los jugadores que participaron en el partido.
                    </p>

                    {[match.teamA, match.teamB].map(teamName => (
                        <div key={teamName} style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>{teamName}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {allPlayers.filter(p => p.teamName === teamName).map(p => {
                                    const isPresent = attendance.includes(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => toggleAttendance(p.id)}
                                            style={{
                                                padding: '12px',
                                                background: isPresent ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.02)',
                                                border: isPresent ? '1px solid var(--primary)' : '1px solid transparent',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '4px',
                                                background: isPresent ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {isPresent && <Check size={14} color="white" />}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                color: 'var(--primary)',
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                minWidth: '24px',
                                                textAlign: 'center',
                                                marginRight: '8px'
                                            }}>
                                                {p.number}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: isPresent ? 'bold' : 'normal', opacity: isPresent ? 1 : 0.7 }}>
                                                {p.nickname || p.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '15px', marginTop: '40px', paddingBottom: '40px' }}>
                        <button
                            onClick={() => setShowAttendance(false)}
                            style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
                        >
                            Volver
                        </button>
                        <button
                            onClick={() => {
                                // Calcular score basado en los eventos registrados
                                const goalsA = events.filter(e => e.type === 'goal' && e.player.teamName === match.teamA).length;
                                const goalsB = events.filter(e => e.type === 'goal' && e.player.teamName === match.teamB).length;
                                const finalScore = `${goalsA} - ${goalsB}`;

                                if (onSaveResult) onSaveResult(match.id, finalScore, attendance);
                                alert(`Partido finalizado: ${finalScore}\nTabla y asistencia guardada.`);
                                onBack();
                            }}
                            style={{ flex: 1, padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
                        >
                            CONFIRMAR TODO
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VotingView = ({ user, polls, userParticipations = [], onVote, onCreatePoll, onClosePoll }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pollToClose, setPollToClose] = useState(null);
    const [newPollTitle, setNewPollTitle] = useState('');
    const [newPollOptions, setNewPollOptions] = useState(['', '']);

    const handleOptionChange = (value, index) => {
        const updated = [...newPollOptions];
        updated[index] = value;
        setNewPollOptions(updated);
    };

    const addOption = () => {
        if (newPollOptions.length < 4) {
            setNewPollOptions([...newPollOptions, '']);
        }
    };

    const createPoll = () => {
        const validOptions = newPollOptions.filter(opt => opt.trim() !== '');
        if (!newPollTitle.trim() || validOptions.length < 2) return;

        // Pass simple array of strings, service handles DB structure
        onCreatePoll({
            title: newPollTitle,
            description: 'Nueva votación creada por administrador.',
            options: validOptions
        });
        setShowCreateModal(false);
        setNewPollTitle('');
        setNewPollOptions(['', '']);
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="title-gradient">Votaciones</h1>
                {user.role === 'admin' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                        + Nueva
                    </button>
                )}
            </div>

            {polls.map(poll => {
                const hasVoted = userParticipations.includes(poll.id);
                const showResults = hasVoted || poll.status === 'closed' || user.role === 'admin' || user.role === 'official';

                // Calculate total votes from options array
                const totalVotes = (poll.options || []).reduce((acc, opt) => acc + (opt.votes || 0), 0);

                return (
                    <div key={poll.id} className="glass-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{poll.title}</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '4px 8px',
                                    borderRadius: '10px',
                                    background: poll.status === 'open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: poll.status === 'open' ? '#22c55e' : '#ef4444',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {poll.status === 'open' ? 'Abierta' : 'Cerrada'}
                                </span>
                                {user.role === 'admin' && poll.status === 'open' && (
                                    <button
                                        onClick={() => setPollToClose(poll)}
                                        style={{
                                            padding: '4px 8px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            border: '1px solid #ef4444',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        CERRAR
                                    </button>
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>{poll.description}</p>

                        {!showResults && poll.status === 'open' ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {(poll.options || []).sort((a, b) => a.id - b.id).map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => onVote(poll.id, opt.id)}
                                        style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {(poll.options || []).sort((a, b) => (b.votes || 0) - (a.votes || 0)).map(opt => {
                                    const votes = opt.votes || 0;
                                    const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                    // Anonymity: We cannot identify "My Vote" anymore from the DB
                                    return (
                                        <div key={opt.id} style={{ position: 'relative', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}></div>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span>{opt.label}</span>
                                                <span style={{ fontWeight: 'bold' }}>{percent}% ({votes})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                    Total Votos: {totalVotes}
                                    {hasVoted && <span style={{ marginLeft: '5px', color: '#22c55e' }}>(Ya has votado)</span>}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {pollToClose && (
                <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 15px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={24} color="#ef4444" />
                        </div>
                        <h3 style={{ marginBottom: '10px' }}>¿Cerrar Votación?</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Al cerrar "<strong>{pollToClose.title}</strong>", ya no se permitirán más votos y los resultados serán visibles para todos. Esta acción es irreversible.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setPollToClose(null)} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                            <button
                                onClick={() => {
                                    onClosePoll(pollToClose.id);
                                    setPollToClose(null);
                                }}
                                style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Sí, Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '350px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Nueva Votación</h3>
                        <input
                            type="text"
                            placeholder="Título (ej: Mejor Gol)"
                            value={newPollTitle}
                            onChange={(e) => setNewPollTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                        />
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {newPollOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    placeholder={`Opción ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                                />
                            ))}
                            {newPollOptions.length < 4 && (
                                <button
                                    onClick={addOption}
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    + Añadir Opción
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={createPoll} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [user, setUser] = useState(null);
    const [season, setSeason] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'home');

    const refreshData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const activeSeason = await getActiveSeason();
            setSeason(activeSeason);

            if (activeSeason) {
                const [teamsData, matchesData, scorersData, officialsData] = await Promise.all([
                    getTeams(),
                    getMatches(activeSeason.id),
                    getTopScorers(activeSeason.id),
                    getOfficials()
                ]);

                // Formateo de partidos y equipos...

                // Format matches to include dynamic score calculation and display mapping
                const formattedMatches = matchesData.map(m => {
                    const goalsA = (m.match_events || []).filter(e => e.event_type === 'goal' && e.team_id === m.team_a_id).length;
                    const goalsB = (m.match_events || []).filter(e => e.event_type === 'goal' && e.team_id === m.team_b_id).length;

                    const dateObj = m.scheduled_at ? new Date(m.scheduled_at) : null;
                    const dateStr = dateObj ? dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Por definir';
                    const timeStr = dateObj ? dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'Próximo';

                    const mainRef = (m.match_assignments || []).find(a => a.role === 'Main Referee')?.official;

                    return {
                        ...m,
                        teamA: m.teamA?.name || 'Error',
                        teamB: m.teamB?.name || 'Error',
                        score: (m.status === 'finished' || m.status === 'playing') ? `${goalsA} - ${goalsB}` : 'vs',
                        goalsA,
                        goalsB,
                        date: dateStr,
                        rawDate: m.scheduled_at ? m.scheduled_at.split('T')[0] : 'Por definir', // For lookup in LIBRES_2026
                        time: m.status === 'finished' ? 'Finalizado' : timeStr,
                        refereeName: m.referee_name,
                        refereeId: m.referee_id,
                        veedorId: m.veedor_id,
                        startedAt: m.started_at,
                        match_events: m.match_events || []
                    };
                });

                // Calculate Team Stats
                const teamsWithStats = (teamsData || []).map(t => {
                    const teamMatches = formattedMatches.filter(m =>
                        (m.team_a_id === t.id || m.team_b_id === t.id) && m.status === 'finished'
                    );

                    const stats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };

                    teamMatches.forEach(m => {
                        stats.pj++;
                        const isTeamA = m.team_a_id === t.id;
                        const myGoals = isTeamA ? m.goalsA : m.goalsB;
                        const oppGoals = isTeamA ? m.goalsB : m.goalsA;

                        stats.gf += myGoals;
                        stats.gc += oppGoals;

                        if (myGoals > oppGoals) {
                            stats.pg++;
                            stats.pts += 3;
                        } else if (myGoals === oppGoals) {
                            stats.pe++;
                            stats.pts += 1;
                        } else {
                            stats.pp++;
                        }
                    });
                    stats.dg = stats.gf - stats.gc;

                    return { ...t, stats };
                });

                setTeams(teamsWithStats);
                setMatches(formattedMatches || []);
                setTopScorers(scorersData || []);
                setOfficials(officialsData || []);

                // Sincronizar usuario logueado con datos frescos si es oficial o jugador
                if (user) {
                    const currentId = user.id;
                    let freshUser = null;

                    // Buscar en oficiales
                    freshUser = (officialsData || []).find(o => o.id === currentId);

                    // Buscar en jugadores si no es oficial
                    if (!freshUser) {
                        for (const t of (teamsData || [])) {
                            const p = (t.players || []).find(pl => pl.id === currentId);
                            if (p) {
                                freshUser = { ...p, role: user.role }; // Mantener rol del login
                                break;
                            }
                        }
                    }

                    if (freshUser) {
                        setUser(prev => ({ ...prev, ...freshUser }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching professional data:', error);
            alert("Error cargando datos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    const [auditLog, setAuditLog] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [selectedMatchIdForVeedor, setSelectedMatchIdForVeedor] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState('');

    // --- MANEJO DEL GESTO "ATRÁS" (BACK GESTURE) ---
    const isSubActive = !!(editingPlayerId || selectedPlayerId || selectedMatchIdForVeedor || showLogoutModal);

    useEffect(() => {
        // Inicializar el estado del historial en la carga
        if (!window.history.state) {
            window.history.replaceState({ isSubView: false }, '');
        }

        const handlePopState = () => {
            // Cuando el usuario usa el gesto "Atrás" físico/del navegador
            setEditingPlayerId(null);
            setSelectedPlayerId(null);
            setSelectedMatchIdForVeedor(null);
            setShowLogoutModal(false);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const currentHistoryIsSub = !!window.history.state?.isSubView;

        if (isSubActive && !currentHistoryIsSub) {
            // Entramos a una sub-vista desde Home -> Empujamos estado
            window.history.pushState({ isSubView: true }, '');
        } else if (!isSubActive && currentHistoryIsSub) {
            // Salimos manualmente (botón de la UI) -> Retrocedemos el historial para sincronizar
            window.history.back();
        }
    }, [isSubActive]);
    // -----------------------------------------------

    // State for Voting System
    const [polls, setPolls] = useState([]);
    const [userParticipations, setUserParticipations] = useState([]);

    const fetchPolls = async () => {
        try {
            const data = await getPolls();
            setPolls(data);

            if (user) {
                const parts = await getUserParticipations(user.id);
                setUserParticipations(parts);
            }
        } catch (error) {
            console.error("Error loading polls:", error);
        }
    };

    // Load polls on mount and when user changes
    useEffect(() => {
        fetchPolls();
    }, [user]);

    const handleVote = async (pollId, optionId) => {
        if (!user) {
            alert("Debes iniciar sesión para votar.");
            return;
        }
        try {
            await votePoll(pollId, optionId, user.id);
            await fetchPolls(); // Refresh results and status
            alert("¡Voto registrado!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCreatePoll = async (pollData) => {
        try {
            await createPoll(pollData);
            await fetchPolls();
        } catch (error) {
            alert("Error creando votación: " + error.message);
        }
    };

    const handleClosePoll = async (pollId) => {
        try {
            await closePoll(pollId);
            await fetchPolls();
        } catch (error) {
            console.error(error);
            alert("Error cerrando votación");
        }
    };

    // ... existing player update logic ...

    const handleUpdatePlayer = async (updatedPlayer) => {
        try {
            // Persistir cambios en Supabase
            const { teamId, team_id, id, teamName, teamColor, persisted, role, stats, category, ...updates } = updatedPlayer;
            const targetTeamId = teamId || team_id;

            // Determinar si es oficial comparando con la lista actual o por sus propiedades
            const isOfficialNode = (officials || []).some(o => o.id === id) ||
                role === 'official' || role === 'veedor' || role === 'arbitro' || category === 'official';

            console.log('[DEBUG] Guardando perfil:', { id, isOfficialNode, updates });

            if (isOfficialNode) {
                // Eliminar campos que no existen en la tabla de oficiales (como el dorsal/number)
                const officialUpdates = { ...updates };
                delete officialUpdates.number;

                const { error: dbError } = await supabase.from('officials').update(officialUpdates).eq('id', id);
                if (dbError) throw dbError;

                // Actualizar estado local inmediato de oficiales
                setOfficials(prev => prev.map(o => o.id === id ? { ...o, ...officialUpdates } : o));
            } else {
                const { error: dbError } = await supabase.from('players').update(updates).eq('id', id);
                if (dbError) throw dbError;
            }

            // Actualizar estado local de equipos (para que el cambio sea visible en la lista)
            if (targetTeamId) {
                setTeams(prevTeams => prevTeams.map(team => {
                    if (team.id !== targetTeamId) return team;
                    return {
                        ...team,
                        players: team.players.map(p => p.id === id ? { ...p, ...updates } : p)
                    };
                }));
            }

            // Cerrar el editor y refrescar la vista si es necesario
            // Usamos setEditingPlayerId(null) para que la UI reaccione cerrando el formulario
            setEditingPlayerId(null);
            setSelectedPlayerId(id);

            // Sincronizar el estado del usuario actual si se editó a sí mismo
            if (user && user.id === id) {
                setUser(prev => ({ ...prev, ...updates }));
            }

            alert("Perfil actualizado correctamente");
            return true;
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("No se pudo guardar en la base de datos. Verifica tu conexión o permisos.");

            // Revertir o manejar local solo si es necesario, pero informar del error es prioridad
            const { teamId, team_id, id, ...updates } = updatedPlayer;
            const targetTeamId = teamId || team_id;
            if (targetTeamId) {
                setTeams(prevTeams => prevTeams.map(team => {
                    if (team.id !== targetTeamId) return team;
                    return {
                        ...team,
                        players: team.players.map(p => p.id === id ? { ...p, ...updates } : p)
                    };
                }));
            }
        }
    };

    const handleAddPlayer = (newPlayer) => {
        const playerWithId = { ...newPlayer, id: Date.now() };
        setTeams(prevTeams => prevTeams.map(team => {
            if (team.id !== newPlayer.teamId) return team;
            return {
                ...team,
                players: [...team.players, playerWithId]
            };
        }));
        alert('Jugador agregado exitosamente');
    };

    const handleUpdateTeam = (updatedTeam) => {
        setTeams(prevTeams => prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    };

    const handleLogin = (userData) => {
        setUser(userData);
        setActiveTab('home');
    };

    const handleLogout = () => {
        setUser(null);
        setActiveTab('home');
        setShowLogoutModal(false);
    };

    const registerAction = (action) => {
        const logEntry = {
            id: Date.now(),
            adminName: user.name,
            action,
            timestamp: new Date().toLocaleTimeString()
        };
        setAuditLog([logEntry, ...auditLog]);
        alert(`Acción registrada por ${user.name}: ${action}`);
    };
    const handleSaveMatchResult = async (matchId, score, attendance = null) => {
        try {
            await updateMatchStatus(matchId, { status: 'finished' });
            await refreshData();
            alert("Partido finalizado y guardado en la base de datos.");
        } catch (error) {
            console.error("Error finishing match:", error);
            alert("Error al finalizar el partido: " + (error.message || "Error de conexión"));
        }
    };

    const handleStartMatch = async (matchId, refereeData) => {
        try {
            if (!refereeData) {
                // Reopen case: Just set status to playing to allow edits
                await updateMatchStatus(matchId, { status: 'playing' });
            } else {
                // Start case: Full initialization
                await startMatch(matchId, refereeData.veedorId, {
                    name: refereeData.refereeName,
                    id: refereeData.refereeId
                });
            }
            await refreshData();
        } catch (error) {
            console.error("Error starting match:", error);
            alert("Error al iniciar/abrir el partido: " + (error.message || "Verifica tu conexión a Supabase"));
        }
    };


    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'white' }}>
                <div className="loader" style={{ marginBottom: '20px' }}></div>
                <p style={{ opacity: 0.7, letterSpacing: '1px' }}>CARGANDO COPA DELTA...</p>
            </div>
        );
    }

    if (!user) {
        if (IS_DEMO_MODE) {
            return <DemoLogin onLogin={handleLogin} />;
        }
        return <Login onLogin={handleLogin} />;
    }

    if (showLogoutModal) {
        return (
            <div className="fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '15px' }}>¿Cerrar Sesión?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button onClick={() => setShowLogoutModal(false)} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={handleLogout} style={{ padding: '10px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Salir</button>
                    </div>
                </div>
            </div>
        );
    }

    // Renderizado condicional de vistas de pantalla completa
    const renderContent = () => {
        if (editingPlayerId) {
            // Encontrar al jugador en todos los equipos
            let playerToEdit = null;
            for (const t of teams) {
                const found = (t.players || []).find(p => p.id === editingPlayerId);
                if (found) {
                    playerToEdit = found;
                    break;
                }
            }
            // Buscar en oficiales
            if (!playerToEdit) {
                playerToEdit = officials.find(o => o.id === editingPlayerId);
            }
            if (playerToEdit) {
                const allPlayers = teams.flatMap(t => t.players || []);
                return (
                    <EditPlayerForm
                        player={playerToEdit}
                        existingPlayers={allPlayers}
                        user={user}
                        onCancel={() => setEditingPlayerId(null)}
                        onSave={(newData) => {
                            // Inyectar categoría si viene de la lista de oficiales para asegurar el guardado correcto
                            const isCurrentlyOfficial = officials.some(o => o.id === playerToEdit.id);
                            return handleUpdatePlayer({
                                ...playerToEdit,
                                ...newData,
                                category: isCurrentlyOfficial ? 'official' : undefined
                            });
                        }}
                    />
                );
            }
        }


        if (selectedMatchIdForVeedor) {
            const m = matches.find(m => m.id === selectedMatchIdForVeedor);
            return <VeedorMatchRegistration match={m} teams={teams} user={user} onBack={() => setSelectedMatchIdForVeedor(null)} onSaveResult={handleSaveMatchResult} onStartMatch={(matchId, refereeData) => handleStartMatch(matchId, { ...refereeData, veedorId: user.id })} onRefresh={() => refreshData(true)} />;
        }

        if (selectedPlayerId) {
            return <UniversalProfileView profileId={selectedPlayerId} onBack={() => setSelectedPlayerId(null)} user={user} teams={teams} officials={officials} onEdit={setEditingPlayerId} />;
        }

        switch (activeTab) {
            case 'home': return <HomePage user={user} onSelectPlayer={setSelectedPlayerId} teams={teams} officials={officials} matches={matches} topScorers={topScorers} onUpdatePlayer={handleUpdatePlayer} onAddPlayer={handleAddPlayer} onSelectMatch={setSelectedMatchIdForVeedor} />;
            case 'matches': return (
                <div className="fade-in">
                    <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Calendario de Partidos</h1>

                    {(() => {
                        const grouped = (matches || []).reduce((acc, m) => {
                            if (!acc[m.date]) acc[m.date] = { date: m.date, raw: m.rawDate, matches: [] };
                            acc[m.date].matches.push(m);
                            return acc;
                        }, {});

                        const availableDates = Object.values(grouped);
                        const currentDate = selectedDateFilter || (availableDates[0]?.date);
                        const selectedGroup = availableDates.find(g => g.date === currentDate);

                        return (
                            <>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                                        Seleccionar Fecha del Torneo
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        overflowX: 'auto',
                                        padding: '5px 5px 15px 5px',
                                        margin: '0 -20px',
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        WebkitOverflowScrolling: 'touch',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none'
                                    }}>
                                        {availableDates.map((g, idx) => {
                                            const isActive = currentDate === g.date;
                                            // Split "Sábado 15 Mayo" -> ["Sábado", "15", "Mayo"]
                                            const parts = g.date.split(' ');
                                            const dayNum = parts[1] || '';
                                            const month = parts[2] || '';

                                            return (
                                                <button
                                                    key={g.date}
                                                    onClick={() => setSelectedDateFilter(g.date)}
                                                    style={{
                                                        flexShrink: 0,
                                                        width: '85px',
                                                        height: '85px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        border: isActive ? '2px solid white' : '1px solid var(--glass-border)',
                                                        borderRadius: '16px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: isActive ? '0 10px 20px rgba(59, 130, 246, 0.4)' : 'none',
                                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                                        padding: '10px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>FECHA {idx + 1}</span>
                                                    <span style={{ fontSize: '22px', fontWeight: '900', lineHeight: '1' }}>{dayNum}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>{month}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <style>{`
                                        div::-webkit-scrollbar { display: none; }
                                    `}</style>
                                </div>

                                {selectedGroup ? (
                                    <div key={selectedGroup.date} className="fade-in" style={{ marginBottom: '40px', position: 'relative' }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                            padding: '15px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            border: '1px solid var(--glass-border)',
                                            boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)',
                                            marginBottom: '20px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h2 style={{ fontSize: '18px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', margin: 0 }}>
                                                    {selectedGroup.date}
                                                </h2>
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                                    FECHA SELECCIONADA
                                                </div>
                                            </div>

                                            {LIBRES_2026[selectedGroup.raw] && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '800', textTransform: 'uppercase' }}>Equipos Libres:</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {LIBRES_2026[selectedGroup.raw].map(team => (
                                                            <span key={team} style={{
                                                                fontSize: '11px',
                                                                background: 'white',
                                                                color: 'var(--primary)',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontWeight: '900',
                                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                            }}>
                                                                {team}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {selectedGroup.matches.map(m => (
                                                <div key={m.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Grupo {m.group} - {m.time}</span>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: (m.status === 'finished' || m.time === 'Finalizado') ? '#ef4444' : (m.status === 'playing' ? '#22c55e' : 'white'),
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {m.status === 'playing' ? <MatchTimer startedAt={m.startedAt} /> : (m.status === 'finished' ? 'Finalizado' : 'Programado')}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 15px' }}>
                                                        <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>{m.teamA}</div>
                                                        <div style={{ margin: '0 15px', display: 'flex', alignItems: 'center' }}>
                                                            <div style={{ padding: '6px 12px', background: 'var(--glass)', borderRadius: '6px', fontWeight: '800', fontSize: '16px', border: '1px solid var(--glass-border)' }}>{m.score}</div>
                                                        </div>
                                                        <div style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>{m.teamB}</div>
                                                    </div>

                                                    {(user.role === 'official' || user.role === 'admin') && (
                                                        <div style={{ padding: '0 15px 15px' }}>
                                                            <button
                                                                onClick={() => setSelectedMatchIdForVeedor(m.id)}
                                                                style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <Edit3 size={14} /> {(m.status === 'finished' || m.time === 'Finalizado') ? 'EDITAR EVENTO' : 'REGISTRAR EVENTOS'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No hay partidos programados para esta fecha.
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            );
            case 'standings': return (
                <div className="fade-in">
                    <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Posiciones</h1>
                    {GROUPS.map(group => (
                        <div key={group.name} style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>{group.name}</h3>
                            <div className="glass-card" style={{ padding: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <tr>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Equipo</th>
                                            <th style={{ padding: '10px', textAlign: 'center' }}>PJ</th>
                                            <th style={{ padding: '10px', textAlign: 'center' }}>DG</th>
                                            <th style={{ padding: '10px', textAlign: 'center' }}>PTS</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: '13px' }}>
                                        {group.teams
                                            .map(teamId => teams.find(t => t.id === teamId))
                                            .filter(t => !!t)
                                            .sort((a, b) => {
                                                if ((b.stats?.pts || 0) !== (a.stats?.pts || 0)) {
                                                    return (b.stats?.pts || 0) - (a.stats?.pts || 0);
                                                }
                                                return (b.stats?.dg || 0) - (a.stats?.dg || 0);
                                            })
                                            .map((team, idx) => {
                                                const stats = team.stats || { pj: 0, pts: 0, dg: 0 };
                                                return (
                                                    <tr key={team.id} style={{ borderBottom: idx < group.teams.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                                        <td style={{ padding: '10px' }}>{idx + 1}</td>
                                                        <td style={{ padding: '10px', fontWeight: '600' }}>{team.name}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>{stats.pj}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px' }}>{stats.dg >= 0 ? `+${stats.dg}` : stats.dg}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>{stats.pts}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            );
            case 'teams': return <TeamsView teams={teams} officials={officials} onSelectPlayer={setSelectedPlayerId} user={user} onUpdateTeam={handleUpdateTeam} />;
            case 'settings': return (
                <div className="fade-in">
                    <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Ajustes</h1>
                    {/* ... (resto del code de settings se mantiene igual) ... */}
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
                        <a href="/reglamento.pdf" download className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', color: 'white', background: 'var(--glass)', padding: '10px', border: '1px solid var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                            <Download size={16} />
                            Descargar Reglamento
                        </a>
                    </div>



                    <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
                        <button
                            onClick={() => setShowLogoutModal(true)}
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
                        Copa Delta App v1.4.0 • 2026
                    </p>
                </div>
            );
            case 'voting': return <VotingView user={user} polls={polls} userParticipations={userParticipations} onVote={handleVote} onCreatePoll={handleCreatePoll} onClosePoll={handleClosePoll} />;
            case 'profile': return <UserProfileView user={user} onUpdateUser={handleUpdatePlayer} onLogout={() => setShowLogoutModal(true)} />;
            default: return null;
        }
    };



    const isMainView = !editingPlayerId && !selectedMatchIdForVeedor && !selectedPlayerId;

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            {isMainView && <GlobalHeader user={user} onSettingsClick={() => setActiveTab('settings')} onProfileClick={() => setActiveTab('profile')} />}
            {renderContent()}

            {showLogoutModal && (
                <div className="fade-in" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-xl)'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ padding: 'var(--spacing-xl)' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                border: '2px solid #ef4444'
                            }}>
                                <LogOut size={30} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>¿Cerrar Sesión?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px' }}>
                                Tendrás que ingresar tus credenciales nuevamente para acceder.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--glass)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        padding: '12px',
                                        background: '#ef4444',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            {isMainView && (
                <div className="fade-in" style={{
                    position: 'fixed',
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    background: 'rgba(3, 7, 18, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-around', // Changed to space-around for full width distribution
                    padding: '12px 10px 25px 10px', // Extra padding bottom for safe area
                    zIndex: 1000,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.4)'
                }}>

                    <NavButton icon={Home} label="Inicio" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavButton icon={Calendar} label="Partidos" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                    <NavButton icon={Trophy} label="Tablas" active={activeTab === 'standings'} onClick={() => setActiveTab('standings')} />
                    <NavButton icon={Shield} label="Equipos" active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} />
                    <NavButton icon={Vote} label="Votaciones" active={activeTab === 'voting'} onClick={() => setActiveTab('voting')} />
                </div>
            )}
        </div>
    );
};

export default App;
