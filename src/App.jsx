import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, Calendar, Trophy, Users, Vote, Shield, X, LogOut } from 'lucide-react';
import Login from './Login.jsx';
import DemoLogin from './components/views/DemoLogin.jsx';
import './index.css';

// Context
import { useApp } from './context/AppContext.jsx';

// Components
import GlobalHeader from './components/shared/GlobalHeader.jsx';
import NavButton from './components/navbar/NavButton.jsx';
import HomePage from './components/views/HomePage.jsx';
import MatchesView from './components/views/MatchesView.jsx';
import StandingsView from './components/views/StandingsView.jsx';
import TeamsView from './components/views/TeamsView.jsx';
import VotingView from './components/views/VotingView.jsx';
import SettingsView from './components/views/SettingsView.jsx';
import VeedorMatchRegistration from './components/views/VeedorMatchRegistration.jsx';
import EditPlayerForm from './components/admin/EditPlayerForm.jsx';
import UserProfileView from './components/profile/UserProfileView.jsx';
import UniversalProfileView from './components/profile/UniversalProfileView.jsx';

// Services
import { startMatch, updateMatchStatus, getPolls, createPoll, votePoll, closePoll, getUserParticipations, updatePlayer } from './services/database.js'; // Keep actions that modify state or aren't in context yet
import { supabase } from './lib/supabaseClient.js';

const IS_DEMO_MODE = true;

const App = () => {
    const { user, login, logout, teams, matches, topScorers, officials, loading, refreshData } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // State for temporary UI interactions (modals, selections)
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [selectedMatchIdForVeedor, setSelectedMatchIdForVeedor] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Voting State (Should eventually move to context or dedicated hook)
    const [polls, setPolls] = useState([]);
    const [userParticipations, setUserParticipations] = useState([]);

    // Temporary fetch for polls until context handles it fully or we use SWR/Query
    useEffect(() => {
        const loadPolls = async () => {
            const data = await getPolls();
            setPolls(data);
            if (user) {
                const parts = await getUserParticipations(user.id);
                setUserParticipations(parts);
            }
        };
        loadPolls();
    }, [user]);

    const handleLogin = (userData) => {
        login(userData);
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    // --- Interaction Handlers ---
    const handleUpdatePlayer = async (updatedPlayer) => {
        try {
            // ... (keep existing logic but use context refresh) ...
            const { teamId, team_id, id, teamName, teamColor, persisted, role, stats, category, ...updates } = updatedPlayer;
            const isOfficialNode = (officials || []).some(o => o.id === id) ||
                role === 'official' || role === 'veedor' || role === 'arbitro' || category === 'official';

            if (isOfficialNode) {
                const officialUpdates = { ...updates };
                delete officialUpdates.number;
                delete officialUpdates.nickname;
                delete officialUpdates.phone;
                const { error } = await supabase.from('officials').update(officialUpdates).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('players').update(updates).eq('id', id);
                if (error) throw error;
            }

            setEditingPlayerId(null);
            setSelectedPlayerId(id);
            alert("Perfil actualizado correctamente");

            // Critical: Refresh context data
            await refreshData(true);

            return true;
        } catch (error) {
            console.error(error);
            alert("Error al actualizar: " + error.message);
        }
    };

    const handleAddPlayer = (newPlayer) => {
        // Logic should be migrated to DB insert + refreshData
        alert("Funcionalidad de agregar pendiente de migración a DB real");
    };

    const handleUpdateTeam = (updatedTeam) => {
        // Logic pending full DB migration
        console.log("Update team", updatedTeam);
    };

    const onSelectMatch = (id) => {
        setSelectedMatchIdForVeedor(id);
    };

    const handleVote = async (pollId, optionId) => {
        if (!user) return alert("Login required");
        try {
            await votePoll(pollId, optionId, user.id);
            // Quick refresh local state
            const data = await getPolls();
            setPolls(data);
            alert("Voto registrado");
        } catch (e) { alert(e.message); }
    };

    // ... (Keep other handlers like createPoll, closePoll, startMatch similarly)

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'white' }}>
                <div className="loader" style={{ marginBottom: '20px' }}></div>
                <p style={{ opacity: 0.7, letterSpacing: '1px' }}>CARGANDO COPA DELTA...</p>
            </div>
        );
    }

    if (!user) {
        return IS_DEMO_MODE ? <DemoLogin onLogin={handleLogin} /> : <Login onLogin={handleLogin} />;
    }

    // Modal Overlays
    // Note: In a full refactor, these would be Routes too (e.g. /profile/edit/:id)
    if (editingPlayerId) {
        // ... Logic to find player ...
        let playerToEdit = null;
        for (const t of teams) {
            const found = (t.players || []).find(p => p.id === editingPlayerId);
            if (found) { playerToEdit = found; break; }
        }
        if (!playerToEdit) playerToEdit = officials.find(o => o.id === editingPlayerId);

        return (
            <EditPlayerForm
                player={playerToEdit}
                existingPlayers={teams.flatMap(t => t.players)}
                user={user}
                onCancel={() => setEditingPlayerId(null)}
                onSave={(data) => {
                    const isOff = officials.some(o => o.id === playerToEdit.id);
                    return handleUpdatePlayer({ ...playerToEdit, ...data, category: isOff ? 'official' : undefined });
                }}
            />
        );
    }

    if (selectedMatchIdForVeedor) {
        const m = matches.find(m => m.id === selectedMatchIdForVeedor);
        return <VeedorMatchRegistration
            match={m}
            teams={teams}
            user={user}
            onBack={() => setSelectedMatchIdForVeedor(null)}
            onSaveResult={async (mid, score) => {
                await updateMatchStatus(mid, { status: 'finished' });
                refreshData();
            }}
            onStartMatch={async (mid, refData) => {
                if (!refData) await updateMatchStatus(mid, { status: 'playing' });
                else await startMatch(mid, refData.veedorId, { name: refData.refereeName, id: refData.refereeId });
                refreshData();
            }}
            onRefresh={() => refreshData(true)}
        />;
    }

    if (selectedPlayerId) {
        return <UniversalProfileView profileId={selectedPlayerId} onBack={() => setSelectedPlayerId(null)} user={user} teams={teams} officials={officials} onEdit={setEditingPlayerId} />;
    }

    // Main Layout
    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <GlobalHeader user={user} onSettingsClick={() => navigate('/settings')} onProfileClick={() => navigate('/profile')} />

            <Routes>
                <Route path="/" element={<HomePage user={user} onSelectPlayer={setSelectedPlayerId} teams={teams} officials={officials} matches={matches} topScorers={topScorers} onUpdatePlayer={handleUpdatePlayer} onAddPlayer={handleAddPlayer} onSelectMatch={onSelectMatch} />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/matches" element={<MatchesView matches={matches} user={user} onSelectMatch={onSelectMatch} />} />
                <Route path="/standings" element={<StandingsView teams={teams} />} />
                <Route path="/teams" element={<TeamsView teams={teams} officials={officials} onSelectPlayer={setSelectedPlayerId} user={user} onUpdateTeam={handleUpdateTeam} />} />
                <Route path="/teams/:teamId" element={<TeamsView teams={teams} officials={officials} onSelectPlayer={setSelectedPlayerId} user={user} onUpdateTeam={handleUpdateTeam} />} />
                <Route path="/voting" element={<VotingView user={user} polls={polls} userParticipations={userParticipations} onVote={handleVote} onCreatePoll={createPoll} onClosePoll={closePoll} />} />
                <Route path="/settings" element={<SettingsView teams={teams} onLogout={() => setShowLogoutModal(true)} />} />
                <Route path="/profile" element={<UserProfileView user={user} onUpdateUser={handleUpdatePlayer} onLogout={() => setShowLogoutModal(true)} />} />
            </Routes>

            {showLogoutModal && (
                <div className="fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '15px' }}>¿Cerrar Sesión?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setShowLogoutModal(false)} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleLogout} style={{ padding: '10px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Salir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav - Only show on main routes */}
            {!editingPlayerId && !selectedMatchIdForVeedor && !selectedPlayerId && (
                <div className="fade-in" style={{
                    position: 'fixed', bottom: '0', left: '0', width: '100%',
                    background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex', justifyContent: 'space-around',
                    padding: '12px 10px 25px 10px', zIndex: 1000
                }}>
                    <NavButton icon={Home} label="Inicio" active={location.pathname === '/'} onClick={() => navigate('/')} />
                    <NavButton icon={Calendar} label="Partidos" active={location.pathname === '/matches'} onClick={() => navigate('/matches')} />
                    <NavButton icon={Trophy} label="Tablas" active={location.pathname === '/standings'} onClick={() => navigate('/standings')} />
                    <NavButton icon={Shield} label="Equipos" active={location.pathname === '/teams'} onClick={() => navigate('/teams')} />
                    <NavButton icon={Vote} label="Votaciones" active={location.pathname === '/voting'} onClick={() => navigate('/voting')} />
                </div>
            )}
        </div>
    );
};

export default App;
