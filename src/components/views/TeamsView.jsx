import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, Edit3, X } from 'lucide-react';
import PlayerAvatar from '../shared/PlayerAvatar.jsx';
import { uploadImage } from '../../services/storage.js';

const TeamsView = ({ teams, officials = [], onSelectPlayer, user, onUpdateTeam }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { teamId } = useParams();
    const selectedTeamId = teamId ? parseInt(teamId) : null;

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const publicUrl = await uploadImage(file, 'images', 'teams');
                if (onUpdateTeam && selectedTeam) {
                    onUpdateTeam({ ...selectedTeam, photo: publicUrl });
                }
            } catch (err) {
                alert("Error subiendo foto: " + err.message);
            }
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
                                    onClick={() => navigate(`/teams/${team.id}`)}
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
                        onClick={() => navigate('/teams')}
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

export default TeamsView;
