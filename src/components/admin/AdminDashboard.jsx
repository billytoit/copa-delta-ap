import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit3, X, ChevronLeft } from 'lucide-react';
import PlayerAvatar from '../shared/PlayerAvatar.jsx';
import EditPlayerForm from './EditPlayerForm.jsx';
import TeamManager from './TeamManager.jsx';
import { getAllowedUsers } from '../../services/database.js';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getAllowedUsers();
            setUsers(data || []);
            setLoading(false);
        };
        load();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u =>
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px' }}>Cargando lista de acceso...</div>;

    return (
        <div>
            <div style={{ marginBottom: '15px' }}>
                <input
                    type="text"
                    placeholder="Buscar por correo o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredUsers.map(u => (
                    <div key={u.email} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{u.email}</div>
                            <div style={{ fontSize: '11px', color: u.assigned_role === 'admin' ? '#eab308' : 'var(--text-secondary)' }}>
                                {u.full_name} ({u.assigned_role})
                            </div>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && <div style={{ opacity: 0.5, textAlign: 'center', padding: '20px' }}>No se encontraron usuarios.</div>}
            </div>
        </div>
    );
};

const AdminDashboard = ({ user, teams = [], officials = [], teamStaff = [], onUpdatePlayer, onSelectPlayer, onAddPlayer, onUpdateTeam }) => {
    const [tab, setTab] = useState('home');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
    const [viewTeamId, setViewTeamId] = useState(null);

    // EXTREME SAFETY CALCULATION
    let allPlayers = [];
    try {
        allPlayers = (teams || [])
            .filter(t => t && (t.players || t.players_list))
            .reduce((acc, t) => {
                const players = (t.players || t.players_list || []);
                if (!Array.isArray(players)) return acc;
                const mapped = players.map(p => ({
                    ...p,
                    name: p.name || 'Sin nombre',
                    teamName: t.name || 'Equipo',
                    teamColor: t.color || 'var(--primary)',
                    teamId: t.id
                }));
                return [...acc, ...mapped];
            }, []);
    } catch (e) {
        console.error("Error calculating allPlayers:", e);
    }

    const totalPlayers = allPlayers.length || 0;
    const totalTeams = (teams || []).length;

    const filteredPlayers = allPlayers.filter(p => {
        const nameText = (p.name || '').toLowerCase();
        const nickText = (p.nickname || '').toLowerCase();
        const search = (searchTerm || '').toLowerCase();
        return nameText.includes(search) || nickText.includes(search);
    });

    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Panel de Control</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['home', 'players', 'teams', 'officials', 'staff', 'users'].map(t => (
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
                        {t === 'home' ? 'Inicio' : t === 'players' ? 'Jugadores' : t === 'teams' ? 'Equipos' : t === 'officials' ? 'Veedores' : t === 'staff' ? 'Dirigentes' : 'Usuarios'}
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
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTeams}</div>
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
                        {filteredPlayers.length > 0 ? filteredPlayers.map(p => (
                            <div
                                key={p.id}
                                onClick={() => onSelectPlayer(p.id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', gap: '10px', cursor: 'pointer' }}
                            >
                                <PlayerAvatar photo={p.photo_url} name={p.name} size={40} borderColor={p.teamColor} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.nickname || p.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.teamName}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}>Ver Perfil</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No se encontraron jugadores.</div>
                        )}
                    </div>
                </div >
            )}

            {tab === 'teams' && (
                <div className="fade-in">
                    {viewTeamId ? (
                        <div>
                            <button
                                onClick={() => setViewTeamId(null)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '10px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                                }}
                            >
                                <ChevronLeft size={18} /> Volver a Equipos
                            </button>
                            <TeamManager user={user} teamId={viewTeamId} teams={teams || []} onSelectPlayer={onSelectPlayer} onAddPlayer={onAddPlayer} onUpdateTeam={onUpdateTeam} />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {(teams || []).map(t => (
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
            )}

            {tab === 'staff' && (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
                        {(teamStaff || []).length > 0 ? (teamStaff || []).map(s => (
                            <div
                                key={s.id}
                                onClick={() => onSelectPlayer(s.profile_id || s.id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', gap: '10px', cursor: 'pointer' }}
                            >
                                <PlayerAvatar photo={s.photo_url} name={s.name} size={40} borderColor={s.team?.color || 'var(--primary)'} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{s.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dirigente de {s.team?.name || 'equipo'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}>Ver Perfil</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No hay dirigentes registrados.</div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'officials' && (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
                        {(officials || []).length > 0 ? (officials || []).map(o => (
                            <div
                                key={o.id}
                                onClick={() => onSelectPlayer(o.id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', gap: '10px', cursor: 'pointer' }}
                            >
                                <PlayerAvatar photo={o.photo_url} name={o.name} size={40} borderColor="var(--primary)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{o.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Veedor / Árbitro</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}>Ver Perfil</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No hay oficiales registrados.</div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'users' && (
                <div className="glass-card">
                    <h3 style={{ marginBottom: '15px', fontSize: '14px' }}>Usuarios y Permisos</h3>
                    <UsersList />
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
