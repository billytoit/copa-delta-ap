import React from 'react';
import { Shield, Edit3 } from 'lucide-react';
import AdminDashboard from '../admin/AdminDashboard.jsx';
import TeamManager from '../admin/TeamManager.jsx';
import SocialBanner from '../shared/SocialBanner.jsx';
import GoleadoresWidget from './GoleadoresWidget.jsx';

const HomePage = ({ user, onSelectPlayer, teams, officials = [], teamStaff = [], matches, topScorers = [], onUpdatePlayer, onAddPlayer, handleUpdateTeam, onSelectMatch }) => {
    // Find next match (first scheduled match)
    // - For players: find next match for THEIR team.
    // - For others (officials, admins): find the next absolute match.
    const nextMatch = matches ? matches.find(m => {
        const isScheduled = (!m.status || m.status === 'scheduled');
        if (!isScheduled) return false;

        if (user.role === 'player' && user.teamId) {
            return m.team_a_id === user.teamId || m.team_b_id === user.teamId;
        }
        return true; // For officials/admins, just take the first scheduled one
    }) : null;

    return (
        <div className="fade-in">
            {/* Header moved to App level */}

            {user.role === 'admin' ? (
                <AdminDashboard
                    user={user}
                    teams={teams}
                    officials={officials}
                    teamStaff={teamStaff}
                    onUpdatePlayer={onUpdatePlayer}
                    onSelectPlayer={onSelectPlayer}
                    onAddPlayer={onAddPlayer}
                    onUpdateTeam={handleUpdateTeam}
                />
            ) : user.role === 'operador' ? (
                <TeamManager user={user} teamId={user.teamId} onSelectPlayer={onSelectPlayer} teams={teams} onAddPlayer={onAddPlayer} onUpdateTeam={handleUpdateTeam} />
            ) : (
                <>
                    {/* Hide SocialBanner for Veedor */}
                    {user.role !== 'official' && <SocialBanner />}

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
                                if (onSelectMatch) {
                                    onSelectMatch(nextMatch.id);
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                <h2 style={{ fontSize: '14px', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {(user.role === 'official' || user.role === 'player') ? 'Tu Próximo Partido' : 'Próximo Partido'}
                                </h2>
                                {user.role === 'official' && <Edit3 size={14} color="var(--primary)" />}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                        <Shield size={24} color="#CB3524" /> {/* Placeholder color if no team color in match data */}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamA}</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '800', opacity: 0.5, padding: '0 10px' }}>VS</div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                        <Shield size={24} color="#034694" />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nextMatch.teamB}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px' }}>
                                {nextMatch.date} - {nextMatch.time}
                            </div>
                        </div>
                    )}

                    <GoleadoresWidget onSelectPlayer={onSelectPlayer} teams={teams} scorers={topScorers} />
                </>
            )}
        </div>
    );
};

export default HomePage;
