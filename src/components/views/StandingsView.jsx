import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GROUPS } from '../../data.js';

const StandingsView = ({ teams }) => {
    const navigate = useNavigate();

    // Dynamic grouping logic with fallback to legacy data.js
    const standingsData = React.useMemo(() => {
        const hasDynamicGroups = teams.some(t => t.group);

        if (hasDynamicGroups) {
            // Group by DB data
            const groupsMap = {};
            teams.forEach(t => {
                const gName = t.group?.name || 'Sin Grupo';
                if (!groupsMap[gName]) groupsMap[gName] = { name: gName, teamObjects: [] };
                groupsMap[gName].teamObjects.push(t);
            });
            return Object.values(groupsMap).sort((a, b) => a.name.localeCompare(b.name));
        }

        // Fallback: Use hardcoded GROUPS and map IDs to objects
        return GROUPS.map(g => ({
            name: g.name,
            teamObjects: g.teams.map(tid => teams.find(t => t.id === tid)).filter(Boolean)
        }));
    }, [teams]);

    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Posiciones</h1>
            {standingsData.map(group => (
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
                                {group.teamObjects
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
                                                    borderBottom: idx < group.teamObjects.length - 1 ? '1px solid var(--glass-border)' : 'none'
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
