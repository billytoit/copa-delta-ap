import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getActiveSeason, getTeams, getMatches, getTopScorers, getOfficials, getPolls } from '../services/database';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [season, setSeason] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const activeSeason = await getActiveSeason();
            setSeason(activeSeason);

            if (activeSeason) {
                const [teamsData, matchesData, scorersData, officialsData] = await Promise.all([
                    getTeams(),
                    getMatches(activeSeason.id),
                    getTopScorers(activeSeason.id),
                    getOfficials()
                ]);

                // Process matches (calculate stats, etc.) - moved from App.jsx logic
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

                // Calculate Team Stats - logic from App.jsx
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
                    return { ...t, stats };
                });

                setTeams(teamsWithStats);
                setMatches(formattedMatches);
                setTopScorers(scorersData);
                setOfficials(officialsData);
            }
        } catch (err) {
            console.error("Context Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        // Fetch role from user_roles table
        let role = 'guest'; // Default
        try {
            // Try to find role by email (since we use email in mock login or real auth)
            // If using real auth uuid, use user_id
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('email', userData.email) // Assuming userData has email
                .single();

            if (roleData) {
                role = roleData.role;
            } else {
                // Check if user is an official in the officials table (legacy check)
                const isOfficial = officials.some(o => o.email === userData.email); // Need email in officials data?
                // Fallback to existing logic if user_roles empty
                role = userData.role || 'guest';
            }
        } catch (e) {
            console.warn("Role fetch failed, using provided role", e);
            role = userData.role;
        }

        setUser({ ...userData, role });
    };

    const logout = () => {
        setUser(null);
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <AppContext.Provider value={{
            user, login, logout,
            season, teams, matches, topScorers, officials,
            loading, error, refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
