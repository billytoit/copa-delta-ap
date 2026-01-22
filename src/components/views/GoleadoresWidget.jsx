import React from 'react';
import { Trophy, Shield } from 'lucide-react';

const GoleadoresWidget = ({ onSelectPlayer, teams, scorers = [] }) => {
    // Si no hay goleadores aún, mostrar estado vacío
    if (!scorers || scorers.length === 0) {
        return (
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-md)', padding: '20px', textAlign: 'center' }}>
                <Trophy size={18} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Aún no hay goles registrados en esta temporada.
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--secondary)" /> Goleadores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scorers.slice(0, 10).map((scorer, idx) => (
                    <div
                        key={scorer.id}
                        onClick={() => onSelectPlayer(scorer.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: idx < scorers.slice(0, 10).length - 1 ? '1px solid var(--glass-border)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '15px' }}>{idx + 1}</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800' }}>{scorer.nickname || scorer.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shield size={10} color={scorer.teamColor} /> {scorer.teamName}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '16px' }}>{scorer.goals}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoleadoresWidget;
