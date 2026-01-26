import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import PlayerAvatar from '../shared/PlayerAvatar.jsx';
import { uploadImage } from '../../services/storage.js';

const EditPlayerForm = ({ player, existingPlayers = [], onSave, onCancel, user }) => {
    const isAdmin = user?.role === 'admin';
    const isLocked = player.status === 'Verificado' && !isAdmin;

    const [formData, setFormData] = useState({
        name: player.name,
        nickname: player.nickname || '',
        number: player.number || '',
        phone: player.phone || '',
        photo_url: player.photo_url,
        bio: player.bio || '',
        job: player.job || '',
        instagram: player.instagram || ''
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setError('');

        if (formData.number) {
            const newNumber = parseInt(formData.number);
            const duplicate = (existingPlayers || []).find(p =>
                p.number === newNumber &&
                p.id !== player.id &&
                p.team_id === player.team_id // Check only in same team
            );

            if (duplicate) {
                setError(`El número ${newNumber} ya está en uso en este equipo por ${duplicate.nickname || duplicate.name}`);
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
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    try {
                                        // Upload to Supabase Storage 'images' bucket, folder 'players'
                                        const publicUrl = await uploadImage(file, 'images', 'players');
                                        setFormData({ ...formData, photo_url: publicUrl });
                                    } catch (err) {
                                        alert("Error subiendo imagen: " + err.message);
                                    }
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
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Bio (Descripción corta)</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={isLocked}
                        placeholder="Define quién eres..."
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text', minHeight: '80px', fontFamily: 'inherit' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Ocupación / Trabajo</label>
                    <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        disabled={isLocked}
                        placeholder="Ej: Ingeniero, Estudiante..."
                        style={{ width: '100%', padding: '10px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'var(--glass)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--text-secondary)' : 'white', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'text' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Instagram (Usuario)</label>
                    <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        disabled={isLocked}
                        placeholder="Ej: @usuario"
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

export default EditPlayerForm;
