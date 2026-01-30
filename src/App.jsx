import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, Calendar, Trophy, Users, Vote, Shield, X, LogOut } from 'lucide-react';
import Login from './components/views/Login.jsx';
// import DemoLogin from './components/views/DemoLogin.jsx'; // Deprecated using Real Auth
import './index.css';

// Context
import { useApp } from './context/AppContext.jsx';

// Components
import GlobalHeader from './components/shared/GlobalHeader.jsx';
import ReloadPrompt from './components/shared/ReloadPrompt.jsx';
import NavButton from './components/navbar/NavButton.jsx';
import GoldSponsorFooter from './components/shared/GoldSponsorFooter.jsx';
import HomePage from './components/views/HomePage.jsx';
import MatchesView from './components/views/MatchesView.jsx';
import StandingsView from './components/views/StandingsView.jsx';
import TeamsView from './components/views/TeamsView.jsx';
import VotingView from './components/views/VotingView.jsx';
import SettingsView from './components/views/SettingsView.jsx';
import VeedorMatchRegistration from './components/views/VeedorMatchRegistration.jsx';
import AccessPendingView from './components/views/AccessPendingView.jsx';
import EditPlayerForm from './components/admin/EditPlayerForm.jsx';
import UserProfileView from './components/profile/UserProfileView.jsx';
import UniversalProfileView from './components/profile/UniversalProfileView.jsx';
import MatchDetailsPage from './components/views/MatchDetailsPage.jsx';
import PlayerProfilePage from './components/views/PlayerProfilePage.jsx';
import ResetPassword from './components/views/ResetPassword.jsx';
import BenefitsView from './components/views/BenefitsView.jsx';

// Services
// Services
import { startMatch, updateMatchStatus, getPolls, createPoll, votePoll, closePoll, getUserParticipations, updatePlayer, updateTeam } from './services/database.js'; // Keep actions that modify state or aren't in context yet
import { supabase } from './lib/supabaseClient.js';

// const IS_DEMO_MODE = true; // DEPRECATED: Using Real Auth

const App = () => {
    const { user, login, logout, teams, matches, topScorers, officials, teamStaff, loading, error, refreshData } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Voting State cleanup: Can stay here or move to Context later
    const [polls, setPolls] = useState([]);
    const [userParticipations, setUserParticipations] = useState([]);

    useEffect(() => {
        const loadPolls = async () => {
            try {
                const data = await getPolls();
                setPolls(data);
                if (user) {
                    const parts = await getUserParticipations(user.id);
                    setUserParticipations(parts);
                }
            } catch (err) {
                console.error("Error loading polls in App:", err);
            }
        };
        if (loading === false) {
            loadPolls();
        }
    }, [user, loading]);

    // HandleLogin is no longer manually called from a demo form, 
    // Auth state is handled by AppContext + Supabase listener.
    // However, if we need to redirect after login, we can do it here or in Login component.
    useEffect(() => {
        if (!user && !loading && location.pathname !== '/login') {
            // Optionally redirect to login if we had a dedicated route, 
            // but currently we show Login component conditionally below.
        }

        // REMOVED unintentional redirect that blocked settings access
    }, [user, loading, location.pathname, navigate]);

    const handleLogout = async () => {
        await logout();
        setShowLogoutModal(false);
        // Navigate or refresh handled by state change
    };

    // --- Interaction Handlers (Now just Navigation helpers or simple actions) ---
    // Note: UpdatePlayer logic moved to PlayerProfilePage for profile edits.
    // However, AddPlayer and UpdateTeam for admin dashboard might still need logic or be moved to AdminPage.
    // For now, we keep them if used by specific views, but update views to Nav.

    const handleAddPlayer = (newPlayer) => {
        alert("Funcionalidad de agregar pendiente de migración a DB real");
    };

    const handleUpdateTeam = async (updatedTeam) => {
        try {
            await updateTeam(updatedTeam.id, { logo_url: updatedTeam.logo_url, photo: updatedTeam.photo });
            refreshData(true); // Silent refresh
        } catch (e) {
            console.error("Error updating team:", e);
            alert("Error al actualizar equipo: " + e.message);
        }
    };

    const handleVote = async (pollId, optionId) => {
        if (!user) return alert("Login required");

        // 1. Snapshot previous state for rollback
        const previousPolls = [...polls];
        const previousParticipations = [...userParticipations];

        // 2. Optimistic State Update
        setPolls(currentPolls => currentPolls.map(p => {
            if (p.id !== pollId) return p;
            return {
                ...p,
                options: p.options.map(opt => {
                    if (opt.id !== optionId) return opt;
                    return { ...opt, votes: (opt.votes || 0) + 1 };
                })
            };
        }));
        setUserParticipations(prev => [...prev, pollId]);

        try {
            // 3. API Call
            await votePoll(pollId, optionId, user.id);
            // No alert needed for a seamless feel, or keep it if preferred.
            // But we've already updated the state, so it's "immediate".
            console.log("Voto sincronizado con el servidor");
        } catch (e) {
            // 4. Rollback on failure
            setPolls(previousPolls);
            setUserParticipations(previousParticipations);
            alert("Error al registrar voto: " + e.message);
        }
    };

    // Wrapper for legacy props (HomePage expects onSelect...)
    // We update HomePage to use navigate directly, OR we pass a shim.
    // Shim is safer for now to avoid Touching EVERYTHING at once.
    const onSelectPlayerShim = (id) => navigate(`/player/${id}`);
    const onSelectMatchShim = (id) => navigate(`/match/${id}`);
    const onUpdatePlayerShim = async (p) => {
        // Redirecting to profile for edit is consistent
        navigate(`/player/${p.id}`);
    };

    const handleUpdateUserProfile = async (updatedData) => {
        try {
            // 1. Update Profile (Global Identity)
            const profileUpdates = {
                full_name: updatedData.name,
                nickname: updatedData.nickname,
                bio: updatedData.bio,
                job: updatedData.job,
                phone: updatedData.phone,
                instagram: updatedData.instagram,
                is_networker: updatedData.is_networker,
                network_keywords: updatedData.network_keywords,
                pref_contact: updatedData.pref_contact
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update Contextual Record (Denormalized data for Lists/Teams)
            // Use user.playerId and user.type from AppContext
            if (user.playerId && user.type) {
                const table = user.type === 'player' ? 'players' :
                    (user.type === 'staff' ? 'team_staff' :
                        (user.type === 'official' ? 'officials' : null));

                if (table) {
                    const contextualUpdates = {
                        name: updatedData.name,
                        nickname: updatedData.nickname,
                        bio: updatedData.bio,
                        job: updatedData.job,
                        phone: updatedData.phone,
                        instagram: updatedData.instagram,
                        is_networker: updatedData.is_networker,
                        network_keywords: updatedData.network_keywords,
                        pref_contact: updatedData.pref_contact
                    };

                    const { error: contextualError } = await supabase
                        .from(table)
                        .update(contextualUpdates)
                        .eq('id', user.playerId);

                    if (contextualError) throw contextualError;
                }
            }

            // 3. Refresh Local State
            await refreshData(true);
            return true;
        } catch (e) {
            console.error("Error updating profile:", e);
            throw e;
        }
    };

    const navigateHome = () => {
        if (location.pathname === '/') {
            // Force re-render/reset if already home
            window.location.reload();
        } else {
            navigate('/');
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

    if (loading === false && error) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'white', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>⚠️ Algo salió mal</p>
                <p style={{ opacity: 0.8, marginBottom: '20px' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white' }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!user) {
        // Show Real Login Component
        return <Login />;
    }

    // BLOCKING: Strict Access Control
    // If user is logged in but role is 'pending', show the Bouncer Screen
    if (user.role === 'pending') {
        return <AccessPendingView />;
    }

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <GlobalHeader
                user={user}
                onSettingsClick={() => navigate('/settings')}
                onProfileClick={() => navigate('/profile')}
                onHomeClick={navigateHome}
            />

            {/* DEBUG OVERLAY - REMOVE AFTER FIXING */}
            {/* REMOVED */}


            <ReloadPrompt />

            <Routes>
                <Route path="/" element={<HomePage user={user} onSelectPlayer={onSelectPlayerShim} teams={teams} officials={officials} teamStaff={teamStaff} matches={matches} topScorers={topScorers} onUpdatePlayer={onUpdatePlayerShim} onAddPlayer={handleAddPlayer} handleUpdateTeam={handleUpdateTeam} onSelectMatch={onSelectMatchShim} />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/matches" element={<MatchesView matches={matches} user={user} onSelectMatch={onSelectMatchShim} teams={teams} />} />
                <Route path="/match/:id" element={<MatchDetailsPage />} />

                <Route path="/standings" element={<StandingsView teams={teams} />} />

                <Route path="/teams" element={<TeamsView teams={teams} officials={officials} onSelectPlayer={onSelectPlayerShim} user={user} onUpdateTeam={handleUpdateTeam} />} />
                <Route path="/teams/:teamId" element={<TeamsView teams={teams} officials={officials} onSelectPlayer={onSelectPlayerShim} user={user} onUpdateTeam={handleUpdateTeam} />} />

                <Route path="/player/:id" element={<PlayerProfilePage />} />

                <Route path="/voting" element={<VotingView user={user} polls={polls} userParticipations={userParticipations} onVote={handleVote} onCreatePoll={createPoll} onClosePoll={closePoll} />} />
                <Route path="/settings" element={<SettingsView teams={teams} onLogout={() => setShowLogoutModal(true)} />} />
                <Route path="/profile" element={<UserProfileView user={user} onUpdateUser={handleUpdateUserProfile} onLogout={() => setShowLogoutModal(true)} />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/benefits" element={<BenefitsView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Gold Sponsors - Now at the bottom of the content, not fixed */}
            {(!location.pathname.startsWith('/match/')) && <GoldSponsorFooter />}

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
            {/* Bottom Nav - Only show on main routes (hide on detailed views like match details) */}
            {(!location.pathname.startsWith('/match/')) && (
                <div style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', zIndex: 1000 }}>
                    <div className="fade-in" style={{
                        background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex', justifyContent: 'space-around',
                        padding: '12px 10px 25px 10px'
                    }}>
                        <NavButton icon={Home} label="Inicio" active={location.pathname === '/'} onClick={() => navigate('/')} />
                        <NavButton icon={Calendar} label="Partidos" active={location.pathname === '/matches'} onClick={() => navigate('/matches')} />
                        <NavButton icon={Trophy} label="Tablas" active={location.pathname === '/standings'} onClick={() => navigate('/standings')} />
                        <NavButton icon={Shield} label="Equipos" active={location.pathname === '/teams'} onClick={() => navigate('/teams')} />
                        <NavButton
                            icon={Vote}
                            label="Votaciones"
                            active={location.pathname === '/voting'}
                            onClick={() => navigate('/voting')}
                            hasBadge={(() => {
                                // Only players and staff (dirigentes) get the notification
                                if (user?.role !== 'player' && user?.role !== 'dirigente') return false;
                                return polls.some(p => p.status === 'open' && !userParticipations.includes(p.id));
                            })()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
