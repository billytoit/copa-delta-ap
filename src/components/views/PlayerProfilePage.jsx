import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UniversalProfileView from '../profile/UniversalProfileView.jsx';
import EditPlayerForm from '../admin/EditPlayerForm.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const PlayerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, teams, officials, teamStaff, refreshData } = useApp();

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
            // pid is the unique id for the record (UUID for players, BIGINT for staff)
            const pid = updatedPlayer.id;

            // Define fields that are common or present in profiles/players/staff
            // These match the columns we added via SQL
            const profileFields = {
                name: updatedPlayer.name,
                photo_url: updatedPlayer.photo_url,
                nickname: updatedPlayer.nickname,
                bio: updatedPlayer.bio,
                job: updatedPlayer.job,
                instagram: updatedPlayer.instagram,
                email: updatedPlayer.email
            };

            const isOfficialNode = (officials || []).some(o => String(o.id) === String(pid)) ||
                updatedPlayer.role === 'official' ||
                updatedPlayer.category === 'official';

            const isStaffNode = (teamStaff || []).some(s => String(s.id) === String(pid)) ||
                updatedPlayer.type === 'staff';

            // Variable to store Supabase response outside and avoid ReferenceErrors
            let updateResult = { data: null, error: null, count: null };

            if (isOfficialNode) {
                updateResult = await supabase.from('officials').update({
                    name: profileFields.name,
                    photo_url: profileFields.photo_url
                }).eq('id', pid).select();
                if (updateResult.error) throw updateResult.error;
            } else if (isStaffNode) {
                const staffUpdates = {
                    ...profileFields,
                    phone: updatedPlayer.phone
                };
                updateResult = await supabase.from('team_staff')
                    .update(staffUpdates)
                    .eq('id', pid)
                    .select();
                if (updateResult.error) throw updateResult.error;
            } else {
                const playerUpdates = {
                    ...profileFields,
                    number: updatedPlayer.number,
                    phone: updatedPlayer.phone
                };
                updateResult = await supabase.from('players')
                    .update(playerUpdates)
                    .eq('id', pid)
                    .select();
                if (updateResult.error) throw updateResult.error;
            }

            const { data, count } = updateResult;

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
        if (!playerToEdit) playerToEdit = teamStaff.find(s => s.id.toString() === id || s.id === id);
    }

    if (isEditing && playerToEdit) {
        return (
            <EditPlayerForm
                player={playerToEdit}
                existingPlayers={teams.flatMap(t => t.players)}
                user={user}
                onCancel={() => setIsEditing(false)}
                onSave={(data) => {
                    const isOff = officials.find(o => String(o.id) === String(playerToEdit.id));
                    const isSta = teamStaff.find(s => String(s.id) === String(playerToEdit.id));
                    return handleUpdatePlayer({
                        ...playerToEdit,
                        ...data,
                        category: isOff ? 'official' : undefined,
                        type: isSta ? 'staff' : playerToEdit.type
                    });
                }}
            />
        )
    }

    return (
        <UniversalProfileView
            profileId={id}
            onBack={handleBack}
            user={user}
            teams={teams}
            officials={officials}
            teamStaff={teamStaff}
            onEdit={() => setIsEditing(true)}
        />
    );
};

export default PlayerProfilePage;
