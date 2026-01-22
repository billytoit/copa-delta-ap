import React, { useState } from 'react';
import { Shield, Edit3, X } from 'lucide-react';
import PlayerAvatar from '../shared/PlayerAvatar.jsx';
import EditPlayerForm from './EditPlayerForm.jsx';
import { uploadImage } from '../../services/storage.js';

const TeamManager = ({ user, teamId, onSelectPlayer, teams, onAddPlayer, onUpdateTeam }) => {
    const team = teams.find(t => t.id === teamId) || { players: [] };
    const [showAddForm, setShowAddForm] = useState(false);

    if (!team) return null;

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Upload to Supabase Storage 'images' bucket, folder 'teams'
                const publicUrl = await uploadImage(file, 'images', 'teams');
                if (onUpdateTeam) {
                    onUpdateTeam({ ...team, photo: publicUrl });
                }
            } catch (err) {
                alert("Error subiendo foto del equipo: " + err.message);
            }
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

export default TeamManager;
