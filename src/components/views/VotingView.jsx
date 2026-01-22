import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const VotingView = ({ user, polls, userParticipations = [], onVote, onCreatePoll, onClosePoll }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pollToClose, setPollToClose] = useState(null);
    const [newPollTitle, setNewPollTitle] = useState('');
    const [newPollOptions, setNewPollOptions] = useState(['', '']);

    const handleOptionChange = (value, index) => {
        const updated = [...newPollOptions];
        updated[index] = value;
        setNewPollOptions(updated);
    };

    const addOption = () => {
        if (newPollOptions.length < 4) {
            setNewPollOptions([...newPollOptions, '']);
        }
    };

    const createPoll = () => {
        const validOptions = newPollOptions.filter(opt => opt.trim() !== '');
        if (!newPollTitle.trim() || validOptions.length < 2) return;

        // Pass simple array of strings, service handles DB structure
        onCreatePoll({
            title: newPollTitle,
            description: 'Nueva votación creada por administrador.',
            options: validOptions
        });
        setShowCreateModal(false);
        setNewPollTitle('');
        setNewPollOptions(['', '']);
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="title-gradient">Votaciones</h1>
                {user.role === 'admin' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                        + Nueva
                    </button>
                )}
            </div>

            {polls.map(poll => {
                const hasVoted = userParticipations.includes(poll.id);
                const showResults = hasVoted || poll.status === 'closed' || user.role === 'admin' || user.role === 'official';

                // Calculate total votes from options array
                const totalVotes = (poll.options || []).reduce((acc, opt) => acc + (opt.votes || 0), 0);

                return (
                    <div key={poll.id} className="glass-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{poll.title}</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '4px 8px',
                                    borderRadius: '10px',
                                    background: poll.status === 'open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: poll.status === 'open' ? '#22c55e' : '#ef4444',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {poll.status === 'open' ? 'Abierta' : 'Cerrada'}
                                </span>
                                {user.role === 'admin' && poll.status === 'open' && (
                                    <button
                                        onClick={() => setPollToClose(poll)}
                                        style={{
                                            padding: '4px 8px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            border: '1px solid #ef4444',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        CERRAR
                                    </button>
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>{poll.description}</p>

                        {!showResults && poll.status === 'open' ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {(poll.options || []).sort((a, b) => a.id - b.id).map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => onVote(poll.id, opt.id)}
                                        style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {(poll.options || []).sort((a, b) => (b.votes || 0) - (a.votes || 0)).map(opt => {
                                    const votes = opt.votes || 0;
                                    const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                    // Anonymity: We cannot identify "My Vote" anymore from the DB
                                    return (
                                        <div key={opt.id} style={{ position: 'relative', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}></div>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span>{opt.label}</span>
                                                <span style={{ fontWeight: 'bold' }}>{percent}% ({votes})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                    Total Votos: {totalVotes}
                                    {hasVoted && <span style={{ marginLeft: '5px', color: '#22c55e' }}>(Ya has votado)</span>}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {pollToClose && (
                <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 15px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={24} color="#ef4444" />
                        </div>
                        <h3 style={{ marginBottom: '10px' }}>¿Cerrar Votación?</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Al cerrar "<strong>{pollToClose.title}</strong>", ya no se permitirán más votos y los resultados serán visibles para todos. Esta acción es irreversible.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setPollToClose(null)} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                            <button
                                onClick={() => {
                                    onClosePoll(pollToClose.id);
                                    setPollToClose(null);
                                }}
                                style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Sí, Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '350px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Nueva Votación</h3>
                        <input
                            type="text"
                            placeholder="Título (ej: Mejor Gol)"
                            value={newPollTitle}
                            onChange={(e) => setNewPollTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                        />
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {newPollOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    placeholder={`Opción ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                                />
                            ))}
                            {newPollOptions.length < 4 && (
                                <button
                                    onClick={addOption}
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    + Añadir Opción
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={createPoll} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VotingView;
