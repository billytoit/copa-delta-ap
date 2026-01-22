import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GROUPS } from '../../data.js';

const StandingsView = ({ teams }) => {
    const navigate = useNavigate();
    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Posiciones</h1>
            {GROUPS.map(group => (
                <div key={group.name} style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>{group.name}</h3>
                    <div className="glass-card" style={{ padding: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Equipo</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>PJ</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>DG</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>PTS</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '13px' }}>
                                {group.teams
                                    .map(teamId => teams.find(t => t.id === teamId))
                                    .filter(t => !!t)
                                    .sort((a, b) => {
                                        if ((b.stats?.pts || 0) !== (a.stats?.pts || 0)) {
                                            return (b.stats?.pts || 0) - (a.stats?.pts || 0);
                                        }
                                        return (b.stats?.dg || 0) - (a.stats?.dg || 0);
                                    })
                                    .map((team, idx) => {
                                        const stats = team.stats || { pj: 0, pts: 0, dg: 0 };
                                        return (
                                            <tr
                                                key={team.id}
                                                onClick={() => navigate(`/teams/${team.id}`)}
                                                className="clickable-row"
                                                style={{
                                                    borderBottom: idx < group.teams.length - 1 ? '1px solid var(--glass-border)' : 'none'
                                                }}
                                            >
                                                <td style={{ padding: '10px' }}>{idx + 1}</td>
                                                <td style={{ padding: '10px', fontWeight: '600' }}>{team.name}</td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>{stats.pj}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px' }}>{stats.dg >= 0 ? `+${stats.dg}` : stats.dg}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>{stats.pts}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StandingsView;
