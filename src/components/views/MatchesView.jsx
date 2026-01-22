import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import MatchTimer from '../shared/MatchTimer.jsx';
import { LIBRES_2026 } from '../../data.js';

const MatchesView = ({ matches, user, onSelectMatch }) => {
    const [selectedDateFilter, setSelectedDateFilter] = useState('');

    const grouped = (matches || []).reduce((acc, m) => {
        if (!acc[m.date]) acc[m.date] = { date: m.date, raw: m.rawDate, matches: [] };
        acc[m.date].matches.push(m);
        return acc;
    }, {});

    const availableDates = Object.values(grouped);
    const currentDate = selectedDateFilter || (availableDates[0]?.date);
    const selectedGroup = availableDates.find(g => g.date === currentDate);

    return (
        <div className="fade-in">
            <h1 className="title-gradient" style={{ marginBottom: '20px' }}>Calendario de Partidos</h1>

            <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                    Seleccionar Fecha del Torneo
                </label>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '5px 5px 15px 5px',
                    margin: '0 -20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    {availableDates.map((g, idx) => {
                        const isActive = currentDate === g.date;
                        // Split "Sábado 15 Mayo" -> ["Sábado", "15", "Mayo"]
                        const parts = g.date.split(' ');
                        const dayNum = parts[1] || '';
                        const month = parts[2] || '';

                        return (
                            <button
                                key={g.date}
                                onClick={() => setSelectedDateFilter(g.date)}
                                style={{
                                    flexShrink: 0,
                                    width: '85px',
                                    height: '85px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: isActive ? '2px solid white' : '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isActive ? '0 10px 20px rgba(59, 130, 246, 0.4)' : 'none',
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    padding: '10px'
                                }}
                            >
                                <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>FECHA {idx + 1}</span>
                                <span style={{ fontSize: '22px', fontWeight: '900', lineHeight: '1' }}>{dayNum}</span>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>{month}</span>
                            </button>
                        );
                    })}
                </div>
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>
            </div>

            {selectedGroup ? (
                <div key={selectedGroup.date} className="fade-in" style={{ marginBottom: '40px', position: 'relative' }}>
                    <div style={{
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        padding: '15px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', margin: 0 }}>
                                {selectedGroup.date}
                            </h2>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                FECHA SELECCIONADA
                            </div>
                        </div>

                        {LIBRES_2026[selectedGroup.raw] && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '800', textTransform: 'uppercase' }}>Equipos Libres:</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {LIBRES_2026[selectedGroup.raw].map(team => (
                                        <span key={team} style={{
                                            fontSize: '11px',
                                            background: 'white',
                                            color: 'var(--primary)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontWeight: '900',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            {team}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        {selectedGroup.matches.map(m => (
                            <div key={m.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Grupo {m.group} - {m.time}</span>
                                    <span style={{
                                        fontSize: '10px',
                                        color: (m.status === 'finished' || m.time === 'Finalizado') ? '#ef4444' : (m.status === 'playing' ? '#22c55e' : 'white'),
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {m.status === 'playing' ? <MatchTimer startedAt={m.startedAt} /> : (m.status === 'finished' ? 'Finalizado' : 'Programado')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 15px' }}>
                                    <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>{m.teamA}</div>
                                    <div style={{ margin: '0 15px', display: 'flex', alignItems: 'center' }}>
                                        <div style={{ padding: '6px 12px', background: 'var(--glass)', borderRadius: '6px', fontWeight: '800', fontSize: '16px', border: '1px solid var(--glass-border)' }}>{m.score}</div>
                                    </div>
                                    <div style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>{m.teamB}</div>
                                </div>

                                <div style={{ padding: '0 15px 15px' }}>
                                    <button
                                        onClick={() => onSelectMatch(m.id)}
                                        style={{ width: '100%', padding: '10px', background: (user.role === 'official' || user.role === 'admin') ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Edit3 size={14} />
                                        {(user.role === 'official' || user.role === 'admin')
                                            ? ((m.status === 'finished' || m.time === 'Finalizado') ? 'EDITAR EVENTO' : 'REGISTRAR EVENTOS')
                                            : 'VER DETALLES DEL PARTIDO'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No hay partidos programados para esta fecha.
                </div>
            )}
        </div>
    );
};

export default MatchesView;
