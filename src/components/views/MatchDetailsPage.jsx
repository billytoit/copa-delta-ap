import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VeedorMatchRegistration from './VeedorMatchRegistration.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { startMatch, updateMatchStatus } from '../../services/database.js';

const MatchDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { matches, teams, user, refreshData, loading } = useApp();
    const [match, setMatch] = useState(null);

    useEffect(() => {
        if (matches.length > 0) {
            const found = matches.find(m => m.id.toString() === id || m.id === id);
            setMatch(found);
        }
    }, [matches, id]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <div className="p-4 text-center">Cargando partido...</div>;

    if (!match) {
        return (
            <div className="p-4 text-center">
                <p>Partido no encontrado o no existe.</p>
                <button onClick={handleBack} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}>Volver al Inicio</button>
            </div>
        );
    }

    return (
        <VeedorMatchRegistration
            match={match}
            teams={teams}
            user={user}
            onBack={handleBack}
            onSaveResult={async (mid, score, attendance) => {
                await updateMatchStatus(mid, { status: 'finished', score, attendance }); // attendance might need separate update logic if not in matches table, but keeping api consistent
                await refreshData();
            }}
            onStartMatch={async (mid, refData) => {
                if (!refData) await updateMatchStatus(mid, { status: 'playing' });
                else await startMatch(mid, refData.veedorId, { name: refData.refereeName, id: refData.refereeId });
                await refreshData();
            }}
            onRefresh={() => refreshData(true)}
        />
    );
};

export default MatchDetailsPage;
