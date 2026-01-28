import React from 'react';
import { Shield, Edit3 } from 'lucide-react';
import AdminDashboard from '../admin/AdminDashboard.jsx';
import TeamManager from '../admin/TeamManager.jsx';
import SocialBanner from '../shared/SocialBanner.jsx';
import GoleadoresWidget from './GoleadoresWidget.jsx';

const HomePage = ({
    user,
    onSelectPlayer,
    teams = [],
    officials = [],
    teamStaff = [],
    matches = [],
    topScorers = [],
    onUpdatePlayer,
    onAddPlayer,
    handleUpdateTeam,
    onSelectMatch
}) => {
    // 1. FAST NULL GUARDS
    if (!user) return <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Cargando perfil...</div>;

    // 2. SAFE NEXT MATCH CALCULATION
    let nextMatch = null;
    try {
        if (Array.isArray(matches)) {
            nextMatch = matches.find(m => {
                if (!m) return false;
                const isScheduled = (!m.status || m.status === 'scheduled');
                if (!isScheduled) return false;

                if (user.role?.toLowerCase() === 'player' && user.teamId) {
                    return m.team_a_id === user.teamId || m.team_b_id === user.teamId;
                }
                return true;
            });
        }
    } catch (e) {
        console.error("Error finding next match:", e);
    }

    // 3. RENDER LOGIC
    try {
        return (
            <div className="fade-in">
                {/* Header moved to App level */}

                {user.role?.toLowerCase() === 'admin' ? (
                    <AdminDashboard
                        user={user}
                        teams={teams || []}
                        officials={officials || []}
                        teamStaff={teamStaff || []}
                        onUpdatePlayer={onUpdatePlayer}
                        onSelectPlayer={onSelectPlayer}
                        onAddPlayer={onAddPlayer}
                        onUpdateTeam={handleUpdateTeam}
                    />
                ) : (user.role?.toLowerCase() === 'operador' || user.role?.toLowerCase() === 'dirigente') ? (
                    <TeamManager user={user} teamId={user.teamId} onSelectPlayer={onSelectPlayer} teams={teams || []} onAddPlayer={onAddPlayer} onUpdateTeam={handleUpdateTeam} />
                ) : (
                    <>
                        {/* Hide SocialBanner for officials (Veedor/Dirigente/Admin) */}
                        {user.role?.toLowerCase() !== 'veedor' && user.role?.toLowerCase() !== 'official' && user.role?.toLowerCase() !== 'dirigente' && <SocialBanner />}

                        {nextMatch && (
                            <div
                                className="glass-card"
                                style={{
                                    marginBottom: 'var(--spacing-md)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                    border: '1px solid var(--primary)'
                                }}
                                onClick={() => {
                                    if (onSelectMatch && nextMatch.id) {
                                        onSelectMatch(nextMatch.id);
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                    <h2 style={{ fontSize: '14px', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        {(user.role?.toLowerCase() === 'official' || user.role?.toLowerCase() === 'veedor' || user.role?.toLowerCase() === 'dirigente' || user.role?.toLowerCase() === 'player') ? 'Tu Próximo Partido' : 'Próximo Partido'}
                                    </h2>
                                    {(user.role?.toLowerCase() === 'official' || user.role?.toLowerCase() === 'veedor') && <Edit3 size={14} color="var(--primary)" />}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                            <Shield size={24} color={nextMatch.teamA?.color || nextMatch.team_a_color || '#CB3524'} />
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamA?.name || nextMatch.team_a_name || 'Equipo A'}</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', opacity: 0.5, padding: '0 10px' }}>VS</div>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                            <Shield size={24} color={nextMatch.teamB?.color || nextMatch.team_b_color || '#034694'} />
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamB?.name || nextMatch.team_b_name || 'Equipo B'}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px' }}>
                                    {nextMatch.date || 'Próximamente'} - {nextMatch.time || ''}
                                </div>
                            </div>
                        )}

                        <GoleadoresWidget onSelectPlayer={onSelectPlayer} teams={teams || []} scorers={topScorers || []} />
                    </>
                )}
            </div>
        );
    } catch (e) {
        console.error("HomePage Render Error:", e);
        return <div style={{ padding: '20px', color: 'red' }}>Error al cargar la página de inicio. Reintente por favor.</div>;
    }
};

export default HomePage;
