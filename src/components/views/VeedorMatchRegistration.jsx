import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Shield, Edit3, Check, X } from 'lucide-react';
import { createMatchEvent, deleteMatchEvent } from '../../services/database.js';

const VeedorMatchRegistration = ({ match, onBack, teams, onSaveResult, onStartMatch, onRefresh, user }) => {
    const [events, setEvents] = useState(() => {
        return (match.match_events || []).map(dbEv => {
            const isNote = dbEv.event_type === 'note';
            return {
                id: dbEv.id,
                type: isNote ? 'note' : (dbEv.event_type === 'goal' ? 'goal' : 'card'),
                color: dbEv.event_type === 'red_card' ? 'Roja' : (dbEv.event_type === 'yellow_card' ? 'Amarilla' : ''),
                player: dbEv.player || {},
                text: dbEv.note_text,
                timestamp: `${dbEv.event_minute || 0}'`
            };
        }).sort((a, b) => b.id - a.id);
    });
    const [note, setNote] = useState('');
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [goalTeamFilter, setGoalTeamFilter] = useState('all');
    const [cardTeamFilter, setCardTeamFilter] = useState('all');

    const matchTeams = teams.filter(t => t.name === match.teamA || t.name === match.teamB);
    const allPlayers = matchTeams.flatMap(t => (t.players || []).map(p => ({ ...p, teamName: t.name, teamId: t.id })));

    // Attendance State
    const [showAttendance, setShowAttendance] = useState(false);
    const [attendance, setAttendance] = useState(() => {
        return allPlayers.map(p => p.id);
    });

    const toggleAttendance = (playerId) => {
        setAttendance(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    };

    const addEvent = async (type, data, timeOverride) => {
        let finalData = { ...data };
        const timestamp = timeOverride || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (type === 'card' && data.color === 'Amarilla') {
            const hasYellow = events.some(e => e.type === 'card' && e.player.id === data.player.id && e.color === 'Amarilla');
            if (hasYellow) {
                finalData.color = 'Doble Amarilla';
            }
        }

        const newEvent = { id: Date.now(), type, ...finalData, timestamp };
        setEvents(prev => [...prev, newEvent].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

        if (type === 'goal' || type === 'card' || type === 'note') {
            try {
                const payload = {
                    match_id: match.id,
                    event_type: type === 'goal' ? 'goal' : (type === 'card' ? (finalData.color === 'Roja' ? 'red_card' : 'yellow_card') : 'note'),
                    event_minute: (() => {
                        if (typeof timestamp === 'string' && timestamp.includes("'")) {
                            return parseInt(timestamp) || 0;
                        }
                        if (match.started_at) {
                            const start = Number(match.started_at);
                            const now = Date.now();
                            const elapsedMs = now - start;
                            const minutes = Math.floor(elapsedMs / 60000);
                            return minutes > 0 ? minutes : 0;
                        }
                        return 0;
                    })()
                };

                if (type === 'note') {
                    payload.note_text = data.text;
                } else {
                    payload.player_id = data.player.id;
                    payload.team_id = data.player.teamId;
                }

                const result = await createMatchEvent(payload);
                if (result && result[0]) {
                    const realId = result[0].id;
                    setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, id: realId } : e));
                }

                if (type === 'goal' && onRefresh) {
                    await onRefresh(true);
                }
            } catch (err) {
                console.error("Error persisting event:", err);
            }
        }
    };

    const deleteEvent = async (id) => {
        try {
            const success = await deleteMatchEvent(id);
            if (!success) {
                alert("No se pudo eliminar el evento. Verifique permisos.");
                return;
            }
            setEvents(prev => prev.filter(e => e.id !== id));
            await onRefresh(true);
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error al eliminar evento: " + error.message);
        }
    };

    const [manualTime, setManualTime] = useState('');
    const [manualMinute, setManualMinute] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00');

    useEffect(() => {
        let interval;
        if (match.status === 'playing' && match.startedAt) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - match.startedAt) / 1000);
                const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
                const seconds = (diff % 60).toString().padStart(2, '0');
                setElapsedTime(`${minutes}:${seconds}`);
            }, 1000);
        } else {
            setElapsedTime('00:00');
        }
        return () => clearInterval(interval);
    }, [match.status, match.startedAt]);

    useEffect(() => {
        if (showGoalForm || showCardForm) {
            setManualTime(elapsedTime);
        }
    }, [showGoalForm, showCardForm, elapsedTime]);

    const [refereeName, setRefereeName] = useState('');
    const [refereeError, setRefereeError] = useState('');
    const [startError, setStartError] = useState('');

    const confirmStartMatch = async () => {
        setStartError('');
        const name = refereeName.trim();
        if (name.length < 3) {
            setRefereeError('El nombre debe tener al menos 3 caracteres.');
            return;
        }

        try {
            if (typeof onStartMatch !== 'function') {
                throw new Error("Internal Error: onStartMatch prop is missing");
            }
            await onStartMatch(match.id, { refereeName: name });
        } catch (err) {
            console.error("Error in confirmStartMatch:", err);
            setStartError("Error: " + (err.message || 'Error desconocido'));
        }
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '30px' }}>
            <button
                onClick={onBack}
                style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                <ChevronLeft size={20} /> VOLVER A PARTIDOS
            </button>

            <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PLANILLA DE CONTROL #{match.id}</span>
                    {match.status === 'playing' ? (
                        <div style={{ padding: '4px 10px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>
                            EN JUEGO • {elapsedTime}
                        </div>
                    ) : match.status === 'finished' ? (
                        <div style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
                            FINALIZADO
                        </div>
                    ) : (
                        <div style={{ padding: '4px 10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--text-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>
                            NO INICIADO
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{match.teamA}</div>
                    </div>
                    <div style={{ padding: '5px 15px', background: 'var(--primary)', borderRadius: '4px', fontWeight: '900', fontSize: '18px' }}>{match.score}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{match.teamB}</div>
                    </div>
                </div>
            </div>

            {(user.role === 'admin' || user.role === 'official') && (!match.status || match.status === 'scheduled') && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary)' }}>Iniciar Partido</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px' }}>Nombre del Árbitro *</label>
                        <input
                            type="text"
                            value={refereeName}
                            onChange={(e) => { setRefereeName(e.target.value); setRefereeError(''); }}
                            placeholder="Ej: Carlos Coll"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-color)', border: refereeError ? '1px solid #ef4444' : '1px solid var(--glass-border)', color: 'white' }}
                        />
                        {refereeError && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px' }}>{refereeError}</div>}
                    </div>
                    <button
                        type="button"
                        onClick={confirmStartMatch}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: refereeName.trim().length < 3 ? '#334155' : '#22c55e',
                            color: refereeName.trim().length < 3 ? '#94a3b8' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: refereeName.trim().length < 3 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                        disabled={refereeName.trim().length < 3}
                    >
                        Confirmar e Iniciar
                    </button>
                </div>
            )}

            {(user.role === 'admin' || user.role === 'official') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <button
                        onClick={() => setShowGoalForm(true)}
                        disabled={match.status !== 'playing' && user.role !== 'admin'}
                        style={{
                            background: (match.status === 'playing' || user.role === 'admin') ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                            color: (match.status === 'playing' || user.role === 'admin') ? 'white' : 'rgba(255,255,255,0.2)',
                            border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                            cursor: (match.status === 'playing' || user.role === 'admin') ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Trophy size={20} /> Registrar Gol
                    </button>
                    <button
                        onClick={() => setShowCardForm(true)}
                        disabled={match.status !== 'playing' && user.role !== 'admin'}
                        style={{
                            background: (match.status === 'playing' || user.role === 'admin') ? '#FFD700' : 'rgba(255,255,255,0.05)',
                            color: (match.status === 'playing' || user.role === 'admin') ? '#000' : 'rgba(255,255,255,0.2)',
                            border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                            cursor: (match.status === 'playing' || user.role === 'admin') ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Shield size={20} /> Tarjetas
                    </button>
                </div>
            )}

            {showGoalForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '20px', border: '1px solid var(--secondary)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>Autor del Gol</h3>
                    {/* Simplified for brevity in rewrite, assume logic is same */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Minuto (Opcional)</label>
                        <input type="number" placeholder="Ej: 45" value={manualMinute} onChange={(e) => setManualMinute(e.target.value)} style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Hora del Evento</label>
                        <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                        <button onClick={() => setGoalTeamFilter('all')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === 'all' ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === 'all' ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => setGoalTeamFilter(match.teamA)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === match.teamA ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === match.teamA ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{match.teamA}</button>
                        <button onClick={() => setGoalTeamFilter(match.teamB)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: goalTeamFilter === match.teamB ? 'white' : 'rgba(255,255,255,0.1)', color: goalTeamFilter === match.teamB ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{match.teamB}</button>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {allPlayers.filter(p => goalTeamFilter === 'all' || p.teamName === goalTeamFilter).sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                            <div key={p.id} onClick={() => {
                                const time = manualMinute ? `${manualMinute}'` : manualTime;
                                addEvent('goal', { player: p }, time);
                                setShowGoalForm(false);
                                setGoalTeamFilter('all');
                                setManualMinute('');
                            }} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{p.nickname || p.name} <span style={{ opacity: 0.5, fontSize: '10px' }}>({p.teamName})</span></span>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>#{p.number}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setShowGoalForm(false); setGoalTeamFilter('all'); }} style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}>Cancelar</button>
                </div>
            )}

            {showCardForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '20px', border: '1px solid #FFD700' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>Sanción Disciplinaria</h3>
                    <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Minuto</label>
                            <input type="number" placeholder="Ej: 32" value={manualMinute} onChange={(e) => setManualMinute(e.target.value)} style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Hora (Opcional)</label>
                            <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '14px' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                        <button onClick={() => setCardTeamFilter('all')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === 'all' ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === 'all' ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => setCardTeamFilter(match.teamA)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === match.teamA ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === match.teamA ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{match.teamA}</button>
                        <button onClick={() => setCardTeamFilter(match.teamB)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: cardTeamFilter === match.teamB ? 'white' : 'rgba(255,255,255,0.1)', color: cardTeamFilter === match.teamB ? 'var(--primary)' : 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{match.teamB}</button>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {allPlayers.filter(p => cardTeamFilter === 'all' || p.teamName === cardTeamFilter).map(p => (
                            <div key={p.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{p.nickname || p.name}</span>
                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>{p.teamName} #{p.number}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => { const time = manualMinute ? `${manualMinute}'` : manualTime; addEvent('card', { player: p, color: 'Amarilla' }, time); setShowCardForm(false); setCardTeamFilter('all'); setManualMinute(''); }} style={{ padding: '6px 12px', background: '#eab308', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Amarilla</button>
                                    <button onClick={() => { const time = manualMinute ? `${manualMinute}'` : manualTime; addEvent('card', { player: p, color: 'Roja' }, time); setShowCardForm(false); setCardTeamFilter('all'); setManualMinute(''); }} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Roja</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setShowCardForm(false); setCardTeamFilter('all'); }} style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}>Cancelar</button>
                </div>
            )}

            {(user.role === 'admin' || user.role === 'official') && (
                <div className="glass-card" style={{ marginBottom: '20px', opacity: (match.status === 'playing' || user.role === 'admin') ? 1 : 0.5, pointerEvents: (match.status === 'playing' || user.role === 'admin') ? 'auto' : 'none' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Notas de Eventualidades</h3>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={(match.status === 'playing' || user.role === 'admin') ? "Ej: Interrupción por lluvia, conducta del público..." : "Inicia el partido para agregar notas."} style={{ width: '100%', height: '80px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '10px', fontSize: '13px' }} />
                    <button onClick={() => { if (note) { addEvent('note', { text: note }, elapsedTime); setNote(''); } }} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Añadir Nota</button>
                </div>
            )}

            <div className="glass-card" style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-secondary)' }}>Registro del Partido</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events.map((ev, index) => {
                        const isTeamA = ev.type !== 'note' && (ev.player.teamName === match.teamA);
                        const isNote = ev.type === 'note';
                        if (isNote) {
                            return (
                                <div key={ev.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--primary)' }}>{ev.timestamp}</span>
                                    {ev.text}
                                </div>
                            );
                        }
                        const highlightColor = ev.type === 'goal' ? '#ffffff' : (ev.color === 'Roja' || ev.color === 'Doble Amarilla') ? '#ef4444' : '#eab308';
                        const eventLabel = ev.type === 'goal' ? 'GOL' : ev.color === 'Doble Amarilla' ? 'DOBLE AMARILLA' : ev.color === 'Roja' ? 'TARJETA ROJA' : 'TARJETA AMARILLA';
                        return (
                            <div key={ev.id} style={{ alignSelf: isTeamA ? 'flex-start' : 'flex-end', width: '90%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)', borderLeft: isTeamA ? `4px solid ${highlightColor}` : '1px solid var(--glass-border)', borderRight: !isTeamA ? `4px solid ${highlightColor}` : '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', paddingLeft: isTeamA ? '16px' : '12px', paddingRight: !isTeamA ? '16px' : '12px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px', color: highlightColor, textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {ev.type === 'goal' && <Trophy size={10} />}
                                        {ev.type === 'card' && <div style={{ width: '8px', height: '10px', background: highlightColor, borderRadius: '1px' }}></div>}
                                        {eventLabel}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{ev.player.nickname || ev.player.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ev.player.teamName} #{ev.player.number}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', opacity: 0.8 }}>{ev.timestamp.split(':').slice(0, 2).join(':')}</div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }} style={{ background: '#ef4444', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color="white" /></button>
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>No hay eventos registrados.</div>}
                </div>
            </div>

            {(user.role === 'admin' || user.role === 'official') && (
                match.status === 'finished' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        {user.role === 'admin' && (
                            <button onClick={() => onSaveResult(match.id, match.score, attendance)} style={{ width: '100%', padding: '18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Edit3 size={18} /> ACTUALIZAR RESULTADO / MARCADOR
                            </button>
                        )}
                        <button onClick={() => { if (window.confirm('¿Reabrir planilla para correcciones?')) { onStartMatch(match.id); } }} style={{ width: '100%', padding: '18px', background: 'var(--glass)', color: 'white', border: '1px solid var(--text-secondary)', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Edit3 size={18} /> HABILITAR EDICIÓN (REABRIR)
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setShowAttendance(true)} disabled={!match.status || match.status === 'scheduled'} style={{ width: '100%', marginTop: '20px', padding: '18px', background: (!match.status || match.status === 'scheduled') ? 'var(--glass)' : 'var(--primary)', color: (!match.status || match.status === 'scheduled') ? 'rgba(255,255,255,0.2)' : 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '16px', cursor: (!match.status || match.status === 'scheduled') ? 'not-allowed' : 'pointer', boxShadow: (!match.status || match.status === 'scheduled') ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
                        FINALIZAR PARTIDO Y TOMAR ASISTENCIA
                    </button>
                )
            )}

            {showAttendance && (
                <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 100, padding: '20px', overflowY: 'auto' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Registro de Asistencia</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '13px' }}>Marque los jugadores que participaron en el partido.</p>
                    {[match.teamA, match.teamB].map(teamName => (
                        <div key={teamName} style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>{teamName}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {allPlayers.filter(p => p.teamName === teamName).map(p => {
                                    const isPresent = attendance.includes(p.id);
                                    return (
                                        <div key={p.id} onClick={() => toggleAttendance(p.id)} style={{ padding: '12px', background: isPresent ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.02)', border: isPresent ? '1px solid var(--primary)' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: isPresent ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isPresent && <Check size={14} color="white" />}
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', minWidth: '24px', textAlign: 'center', marginRight: '8px' }}>{p.number}</div>
                                            <span style={{ fontSize: '13px', fontWeight: isPresent ? 'bold' : 'normal', opacity: isPresent ? 1 : 0.7 }}>{p.nickname || p.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '40px', paddingBottom: '40px' }}>
                        <button onClick={() => setShowAttendance(false)} style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Volver</button>
                        <button onClick={() => {
                            const goalsA = events.filter(e => e.type === 'goal' && e.player.teamName === match.teamA).length;
                            const goalsB = events.filter(e => e.type === 'goal' && e.player.teamName === match.teamB).length;
                            const finalScore = `${goalsA} - ${goalsB}`;
                            if (onSaveResult) onSaveResult(match.id, finalScore, attendance);
                            alert(`Partido finalizado: ${finalScore}\nTabla y asistencia guardada.`);
                            onBack();
                        }} style={{ flex: 1, padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}>CONFIRMAR TODO</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VeedorMatchRegistration;
