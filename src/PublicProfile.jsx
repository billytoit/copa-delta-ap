const UniversalProfileView = ({ profileId, onBack, user, teams, onEdit }) => {
    // 1. Find the player
    let player = null;
    let playerTeam = null;

    for (const t of teams) {
        const found = t.players.find(p => p.id === profileId);
        if (found) {
            player = found;
            playerTeam = t;
            break;
        }
    }

    if (!player) return <div className="fade-in" style={{ padding: '20px', textAlign: 'center' }}>Jugador no encontrado. <button onClick={onBack}>Volver</button></div>;

    // 2. Mock Stats (if not present in player object)
    const stats = player.stats || { goals: 0, redCards: 0, yellowCards: 0, matches: 0 };

    return (
        <div className="fade-in" style={{ paddingBottom: '50px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                    <ChevronLeft size={24} /> Volver
                </button>
                {/* Admin Actions */}
                {(user.role === 'admin') && (
                    <button
                        onClick={() => onEdit(player.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                    >
                        <Edit3 size={16} /> Editar
                    </button>
                )}
            </div>

            {/* HERO CARD (Dark Tone) */}
            <div className="glass-card" style={{
                textAlign: 'center',
                padding: '30px 20px',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 1) 100%)', // Darker background
                border: '1px solid var(--glass-border)',
                marginBottom: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Team Shield Decoration */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                    <Shield size={180} color={playerTeam.color} />
                </div>

                {/* Avatar */}
                <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 15px',
                    borderRadius: '50%',
                    border: `3px solid ${playerTeam.color}`,
                    padding: '3px', // Gap between border and image
                }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--glass)' }}>
                        <PlayerAvatar photo={player.photo} name={player.name} size={90} borderColor="transparent" />
                    </div>
                </div>

                {/* Name & Nickname */}
                <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px', color: 'white' }}>
                    {player.nickname ? player.nickname.toUpperCase() : player.name.split(' ')[0].toUpperCase()}
                </h1>
                <h2 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '20px' }}>
                    {player.name}
                </h2>

                {/* Role Badge */}
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {player.position} OFICIAL
                    </span>
                </div>

                {/* Team Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Shield size={16} color={playerTeam.color} />
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: playerTeam.color }}>{playerTeam.name}</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)', marginLeft: '5px' }}>#{player.number}</span>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="glass-card" style={{ padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '15px', borderRight: '1px solid var(--glass-border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Posición</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--secondary)' }}>{player.position.substring(0, 3)}</div>
                    </div>
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Goles</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{stats.goals}</div>
                    </div>
                </div>
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Torneo</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Copa Delta 2026</span>
                </div>
            </div>

            {/* BIO & INFO (Conditionals) */}
            {(player.bio || player.job) && (
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    {player.bio && (
                        <div style={{ marginBottom: player.job ? '15px' : '0' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                                <MessageCircle size={14} color="var(--primary)" />
                                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>BIO</span>
                            </div>
                            <p style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.4' }}>
                                "{player.bio}"
                            </p>
                        </div>
                    )}

                    {player.job && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: player.bio ? '15px' : '0', paddingTop: player.bio ? '15px' : '0', borderTop: player.bio ? '1px solid var(--glass-border)' : 'none' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}>
                                <Users size={14} color="var(--text-secondary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Ocupación</div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{player.job}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PUBLIC CONTACT (Conditionals) */}
            {(player.instagram || player.email || player.phone) && (
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase' }}>Contacto</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {player.instagram && (
                            <a href={`https://instagram.com/${player.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Instagram size={18} color="#e1306c" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>@{player.instagram.replace('@', '')}</span>
                            </a>
                        )}
                        {player.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Mail size={18} color="var(--secondary)" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{player.email}</span>
                            </div>
                        )}
                        {player.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Phone size={18} color="#22c55e" />
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{player.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FOOTER ACTION */}
            <div style={{ marginTop: '30px' }}>
                <button style={{ width: '100%', padding: '15px', background: 'none', border: '1px dashed var(--text-secondary)', borderRadius: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: '12px' }}>¿Algún dato es incorrecto? Reportar error</span>
                </button>
            </div>

        </div>
    );
};
