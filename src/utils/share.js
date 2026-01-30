const EMOJIS = {
    TROPHY: '\u{1F3C6}',
    SOCCER: '\u{26BD}',
    CALENDAR: '\u{1F4C5}',
    NOTE: '\u{1F4DD}',
    YELLOW_CARD: '\u{1F7E8}',
    RED_CARD: '\u{1F7E5}',
    COMMENT: '\u{1F4AC}',
    LINK: '\u{1F517}',
    TIMER: '\u{23F1}\u{FE0F}',
    ROCKET: '\u{1F680}',
    FINISH: '\u{1F3C1}'
};

export const generateMatchShareText = (match) => {
    // 1. Header Info
    let text = `${EMOJIS.SOCCER} *${match.teamA} ${match.score || 'vs'} ${match.teamB}*\n`;
    text += `${EMOJIS.CALENDAR} ${match.date} - ${match.time}\n\n`;

    // 2. Chronological Timeline
    const allEvents = [...(match.match_events || [])].sort((a, b) => (a.event_minute || 0) - (b.event_minute || 0));

    if (match.status !== 'scheduled') {
        text += `${EMOJIS.TIMER} *Cronología del Match:*\n`;
        text += `${EMOJIS.ROCKET} *0'* - Inicio del Partido\n`;

        allEvents.forEach(e => {
            const min = e.event_minute || 0;
            const type = e.type || e.event_type;
            const player = e.player || { name: 'Jugador' };
            const pName = player.nickname || player.name || 'Jugador';
            const team = e.team_id ? (e.team_id === match.team_a_id ? match.teamA : match.teamB) : '';

            if (type === 'goal') {
                text += `${EMOJIS.SOCCER} *${min}'* - ¡GOL! ${pName}${team ? ` (${team})` : ''}\n`;
            } else if (['card', 'yellow_card', 'red_card', 'double_yellow'].includes(type)) {
                const isRed = type === 'red_card' || type === 'double_yellow' || e.color === 'Roja';
                const cardIcon = isRed ? EMOJIS.RED_CARD : EMOJIS.YELLOW_CARD;
                const cardLabel = isRed ? 'Tarjeta Roja' : 'Tarjeta Amarilla';
                text += `${cardIcon} *${min}'* - ${cardLabel}: ${pName}\n`;
            } else if (type === 'note') {
                const noteText = e.text || e.note_text;
                if (noteText) text += `${EMOJIS.COMMENT} *${min}'* - ${noteText}\n`;
            }
        });

        if (match.status === 'finished') {
            text += `${EMOJIS.FINISH} *Final* - Resultado: ${match.score}\n`;
        }
    } else {
        text += `${EMOJIS.TROPHY} *¡No te pierdas este encuentro!*\n`;
    }

    // 3. Footer
    text += `\n${EMOJIS.LINK} *Ver en vivo:* https://copadelta.app/match/${match.id}`;

    return text;
};

export const shareMatchOnWhatsApp = (match) => {
    const text = generateMatchShareText(match);
    // Using api.whatsapp.com as it can be more reliable in some PWA contexts
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};
