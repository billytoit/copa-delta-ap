import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UniversalProfileView from '../profile/UniversalProfileView.jsx';
import EditPlayerForm from '../admin/EditPlayerForm.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const PlayerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, teams, officials, refreshData } = useApp();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Internal state for editing (nested mode inside the page)
    const [isEditing, setIsEditing] = useState(false);

    const handleBack = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            navigate(-1);
        }
    };

    const handleUpdatePlayer = async (updatedPlayer) => {
        try {
            const { teamId, team_id, id: pid, teamName, teamColor, persisted, role, stats, category, ...updates } = updatedPlayer;
            const isOfficialNode = (officials || []).some(o => o.id === pid) ||
                role === 'official' || role === 'veedor' || role === 'arbitro' || category === 'official';

            if (isOfficialNode) {
                const officialUpdates = { ...updates };
                // cleanup fields
                delete officialUpdates.number;
                delete officialUpdates.nickname;
                delete officialUpdates.phone;
                const { error } = await supabase.from('officials').update(officialUpdates).eq('id', pid);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('players').update(updates).eq('id', pid);
                if (error) throw error;
            }

            setIsEditing(false);
            alert("Perfil actualizado correctamente");

            await refreshData(true);
            return true;
        } catch (error) {
            console.error(error);
            alert("Error al actualizar: " + error.message);
        }
    };

    // Logic to find player to edit
    let playerToEdit = null;
    if (isEditing) {
        for (const t of teams) {
            const found = (t.players || []).find(p => p.id.toString() === id || p.id === id);
            if (found) { playerToEdit = found; break; }
        }
        if (!playerToEdit) playerToEdit = officials.find(o => o.id.toString() === id || o.id === id);
    }

    if (isEditing && playerToEdit) {
        return (
            <EditPlayerForm
                player={playerToEdit}
                existingPlayers={teams.flatMap(t => t.players)}
                user={user}
                onCancel={() => setIsEditing(false)}
                onSave={(data) => {
                    const isOff = officials.some(o => o.id === playerToEdit.id);
                    return handleUpdatePlayer({ ...playerToEdit, ...data, category: isOff ? 'official' : undefined });
                }}
            />
        )
    }

    return (
        <UniversalProfileView
            profileId={id} // The view component handles lookup or fetches if needed, but here we ideally pass data? 
            // Looking at UniversalProfileView, it takes profileId and does lookup in props 'teams'/'officials'. Perfect.
            onBack={handleBack}
            user={user}
            teams={teams}
            officials={officials}
            onEdit={() => setIsEditing(true)}
        />
    );
};

export default PlayerProfilePage;
