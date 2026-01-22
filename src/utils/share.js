export const generateMatchShareText = (match) => {
    // 1. Basic Info
    let text = `🏆 *COPA DELTA 2026*\n\n`;
    text += `⚽ ${match.teamA} ${match.score || 'vs'} ${match.teamB}\n`;
    text += `📅 ${match.date} - ${match.time}\n`;

    // 2. Events Summary (if finished or playing)
    if (match.status !== 'scheduled' && match.match_events && match.match_events.length > 0) {
        text += `\n📝 *Detalles:*\n`;

        // Goals
        const goals = match.match_events.filter(e => e.type === 'goal');
        if (goals.length > 0) {
            text += `⚽ *Goles:*\n`;
            goals.forEach(g => {
                const player = g.player || { name: 'Desconocido' };
                text += `- ${player.nickname || player.name} (${g.player?.teamName || ''})\n`;
            });
        }

        // Cards
        const cards = match.match_events.filter(e => e.type === 'card');
        if (cards.length > 0) {
            text += `🟨 *Tarjetas:*\n`;
            cards.forEach(c => {
                const player = c.player || { name: 'Desconocido' };
                const icon = c.color === 'Roja' ? '🟥' : '🟨';
                text += `${icon} ${player.nickname || player.name} (${c.player?.teamName || ''})\n`;
            });
        }

        // Notes (Veedor Comments)
        const notes = match.match_events.filter(e => e.type === 'note');
        if (notes.length > 0) {
            text += `\n💬 *Observaciones:*\n`;
            notes.forEach(n => {
                text += `"${n.text}"\n`;
            });
        }
    }

    // 3. Link
    text += `\n🔗 *Ver Partido:* https://copadelta.app/match/${match.id}`;

    return encodeURIComponent(text);
};

export const shareMatchOnWhatsApp = (match) => {
    const text = generateMatchShareText(match);
    window.open(`https://wa.me/?text=${text}`, '_blank');
};
