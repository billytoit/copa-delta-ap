import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getActiveSeason, getTeams, getMatches, getTopScorers, getOfficials, getTeamStaff, getPolls } from '../services/database';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [season, setSeason] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [officials, setOfficials] = useState([]);
    const [teamStaff, setTeamStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true); // Separate Auth Loading
    const [error, setError] = useState(null);

    // --- Authentication Logic (Supabase Real Auth) ---
    useEffect(() => {
        // 1. Check active session
        async function loadAuth() {
            setAuthLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            await fetchUserRole(session?.user);
            setAuthLoading(false);
        }
        loadAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchUserRole(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (authUser) => {
        if (!authUser) {
            setUser(null);
            return;
        }

        try {
            // 1. Fetch Role (Critical)
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', authUser.id)
                .maybeSingle(); // Use maybeSingle to avoid error on no rows

            const role = roleData?.role || 'pending';

            // 2. Fetch Profile (Optional - might not exist yet)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            const profile = profileData || {};

            // 3. Fetch Player Record (to get Team info)
            const { data: playerData } = await supabase
                .from('players')
                .select('*, team:teams(*)')
                .eq('profile_id', authUser.id)
                .maybeSingle();

            // 4. Fallback for Officials if no player record
            let officialData = null;
            if (!playerData) {
                const { data } = await supabase
                    .from('officials')
                    .select('*')
                    .eq('profile_id', authUser.id)
                    .maybeSingle();
                officialData = data;
            }

            // Enrich user object
            setUser({
                ...authUser, // Spread authUser FIRST
                id: authUser.id,
                email: authUser.email,
                role: role, // Explicit role overrides authUser.role
                name: profile.full_name || playerData?.name || officialData?.name || authUser.email.split('@')[0],
                avatar: profile.avatar_url || playerData?.photo_url || officialData?.photo_url,
                // Merged Player Data
                teamName: playerData?.team?.name,
                teamId: playerData?.team_id,
                teamColor: playerData?.team?.color,
                number: playerData?.number,
                playerId: playerData?.id,
                ...profile,
                // Ensure bio/job/etc are available even if profile is empty but player has them?
                // Actually players table might not have bio/job, usually it's in profile.
                // But let's be safe.
                stats: playerData?.stats,
            });
        } catch (err) {
            console.error("Error fetching user data:", err);
            // Fallback: If EVERYTHING fails, at least let them exist as pending
            setUser({ id: authUser.id, email: authUser.email, role: 'pending' });
        }
    };

    const login = async (email, password) => {
        // Wrapper not strictly needed as we use direct Supabase calls in Login.jsx,
        // but kept for compatibility if needed.
        return supabase.auth.signInWithPassword({ email, password });
    };

    const logout = async () => {
        console.log("Logout initiated...");
        try {
            await supabase.auth.signOut();
            console.log("Supabase signOut success");
            setUser(null);
            window.location.href = '/login'; // Force reload to login
        } catch (e) {
            console.error("Logout error:", e);
            setUser(null);
            window.location.reload();
        }
    };

    const refreshData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const activeSeason = await getActiveSeason();
            setSeason(activeSeason);

            if (activeSeason) {
                const [teamsData, matchesData, scorersData, officialsData, staffData] = await Promise.all([
                    getTeams(),
                    getMatches(activeSeason.id),
                    getTopScorers(activeSeason.id),
                    getOfficials(),
                    getTeamStaff()
                ]);

                // Process matches (calculate stats, etc.)
                const formattedMatches = matchesData.map(m => {
                    const goalsA = (m.match_events || []).filter(e => e.event_type === 'goal' && e.team_id === m.team_a_id).length;
                    const goalsB = (m.match_events || []).filter(e => e.event_type === 'goal' && e.team_id === m.team_b_id).length;

                    return {
                        ...m,
                        goalsA,
                        goalsB,
                        score: (m.status === 'finished' || m.status === 'playing') ? `${goalsA} - ${goalsB}` : 'vs',
                        date: m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Por definir',
                        time: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'Próximo',
                        teamA: m.teamA?.name || 'Error',
                        teamB: m.teamB?.name || 'Error',
                        rawDate: m.scheduled_at ? m.scheduled_at.split('T')[0] : 'Por definir'
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

                        if (myGoals > oppGoals) { stats.pg++; stats.pts += 3; }
                        else if (myGoals === oppGoals) { stats.pe++; stats.pts += 1; }
                        else { stats.pp++; }
                    });
                    stats.dg = stats.gf - stats.gc;

                    // ENRIQUECER JUGADORES CON GOLES (Desde view_top_scorers)
                    const enrichedPlayers = (t.players || []).map(p => {
                        const scorerInfo = scorersData.find(s => s.id === p.id);
                        return {
                            ...p,
                            stats: {
                                ...p.stats,
                                goals: scorerInfo ? scorerInfo.goals : 0
                            }
                        };
                    });

                    return { ...t, stats, players: enrichedPlayers };
                });

                setTeams(teamsWithStats);
                setMatches(formattedMatches);
                setTopScorers(scorersData);
                setOfficials(officialsData);
                setTeamStaff(staffData);

                // ACTUALIZAR ESTADÍSTICAS DEL USUARIO LOGUEADO
                setUser(prev => {
                    if (!prev) return null;
                    // Encontrar al jugador en los equipos enriquecidos
                    const allPlayers = teamsWithStats.flatMap(t => t.players || []);
                    const foundPlayer = allPlayers.find(p => String(p.id) === String(prev.playerId || prev.id));

                    if (foundPlayer) {
                        return {
                            ...prev,
                            stats: foundPlayer.stats,
                            // Si el avatar estaba vacío, usar la foto del jugador
                            avatar: prev.avatar || foundPlayer.photo_url,
                        };
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("Context Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <AppContext.Provider value={{
            user, login, logout,
            season, teams, matches, topScorers,
            officials,
            teamStaff,
            loading: loading || authLoading, // Combined loading state
            error, refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
