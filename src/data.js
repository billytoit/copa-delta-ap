export const TEAMS_2026 = [
    { id: 1, name: 'Atlético', color: '#CB3524' },
    { id: 2, name: 'Chelsea', color: '#034694' },
    { id: 3, name: 'Real Madrid', color: '#FFFFFF' },
    { id: 4, name: 'Manchester City', color: '#6CABDD' },
    { id: 5, name: 'Al Hilal', color: '#1E40AF' },
    { id: 6, name: 'Bayern Múnich', color: '#DC052D' },
    { id: 7, name: 'Benfica', color: '#E81C2E' },
    { id: 8, name: 'Borussia Dortmund', color: '#FDE100' },
    { id: 9, name: 'Inter Miami', color: '#F4B5CD' },
    { id: 10, name: 'Inter', color: '#0068A8' },
    { id: 11, name: 'Juventus', color: '#000000' },
    { id: 12, name: 'León', color: '#006B3F' },
    { id: 13, name: 'Los Angeles FC', color: '#000000' },
    { id: 14, name: 'Pachuca', color: '#004A99' },
    { id: 15, name: 'Porto', color: '#005CA9' },
    { id: 16, name: 'Paris Saint‑Germain', color: '#004170' },
    { id: 17, name: 'Red Bull Salzburg', color: '#B3012F' },
    { id: 18, name: 'Seattle', color: '#5D9741' }
];

export const GROUPS = [
    { name: 'Grupo A', teams: [5, 6, 12, 3, 8, 9, 4, 16, 13] },
    { name: 'Grupo B', teams: [2, 7, 15, 14, 17, 11, 18, 1, 10] }
];

const datesRaw = [
    "2026-05-15", "2026-05-22", "2026-05-29",
    "2026-06-05", "2026-06-12", "2026-06-19",
    "2026-06-26", "2026-07-03", "2026-07-10"
];

const mapA = [5, 6, 12, 3, 8, 9, 4, 16, 13];
const mapB = [2, 7, 15, 14, 17, 11, 18, 1, 10];

export const MATCHES_2026 = [];
export const LIBRES_2026 = {}; // Key will be the date string YYYY-MM-DD

const generate = (map, groupName) => {
    const n = map.length;
    for (let j = 0; j < n; j++) {
        const dateKey = datesRaw[j];
        const libreId = map[j];
        const teamFound = TEAMS_2026.find(t => t.id === libreId);
        const libreName = teamFound ? teamFound.name : 'Libre';

        if (!LIBRES_2026[dateKey]) LIBRES_2026[dateKey] = [];
        LIBRES_2026[dateKey].push(libreName);

        for (let i = 1; i <= 4; i++) {
            const idA = map[(j + i) % n];
            const idB = map[(j + n - i) % n];
            const tA = TEAMS_2026.find(t => t.id === idA)?.name || 'TBD';
            const tB = TEAMS_2026.find(t => t.id === idB)?.name || 'TBD';

            MATCHES_2026.push({
                id: MATCHES_2026.length + 1,
                teamA: tA,
                teamB: tB,
                team_a_id: idA,
                team_b_id: idB,
                score: 'vs',
                time: (MATCHES_2026.length % 8 < 3 ? '15:00 HS' : (MATCHES_2026.length % 8 < 6 ? '16:30 HS' : '18:00 HS')),
                date: dateKey, // Use raw date for matching
                stadium: 'Cancha 1',
                group: groupName
            });
        }
    }
};

generate(mapA, 'A');
generate(mapB, 'B');

export const TOP_SCORERS_2026 = [];
export const REFEREES_2026 = [];
export const OFFICIALS_2026 = [];
export const SOCIAL_MESSAGES = ['"Copa Delta: Pasión con respeto y seguridad."'];
