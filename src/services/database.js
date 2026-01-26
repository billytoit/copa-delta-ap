import { supabase } from '../lib/supabaseClient'

export const getActiveSeason = async () => {
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data
}

export const getTeams = async () => {
    const { data, error } = await supabase
        .from('teams')
        .select(`
            *,
            players(*),
            group:groups(*)
        `)
    if (error) throw error
    return data
}

export const getMatches = async (seasonId) => {
    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            teamA:teams!team_a_id(*),
            teamB:teams!team_b_id(*),
            match_events(*, player:players(*)),
            match_assignments(*, official:officials(*))
        `)
        .eq('season_id', seasonId)
    if (error) throw error
    return data
}

export const getTopScorers = async (seasonId) => {
    // OPTIMIZADO: Usar Vista SQL en lugar de cálculo en cliente
    const { data, error } = await supabase
        .from('view_top_scorers')
        .select('*')
        .eq('season_id', seasonId)
        .order('goals', { ascending: false });

    if (error) {
        console.error("Error fetching top scorers view:", error);
        throw error;
    }

    // Mapear al formato que espera la UI
    return data.map(row => ({
        id: row.player_id,
        name: row.name,
        nickname: row.nickname,
        photo_url: row.photo_url,
        teamName: row.team_name || 'Sin Equipo',
        teamColor: row.team_color || 'var(--primary)',
        goals: row.goals
    }));
}

export const createMatchEvent = async (event) => {
    const { data, error } = await supabase
        .from('match_events')
        .insert(event)
        .select()
    if (error) throw error
    return data
}

export const deleteMatchEvent = async (id) => {
    const { data, error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', id)
        .select()

    if (error) throw error
    if (!data || data.length === 0) {
        console.warn("No se eliminó ninguna fila. Verifique permisos RLS o que el ID existe:", id);
        return false;
    }
    return true;
}

export const updateMatchStatus = async (id, updates) => {
    const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', id)
    if (error) throw error
    return data
}

export const getReferees = async () => {
    // Fetch users with role 'arbitro' (or just specific ones if needed)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
    //.eq('role', 'arbitro') // Uncomment if role filtering is strict
    // For demo, we might want to return all profiles to ensure we see something
    if (error) {
        console.warn("Error fetching referees, using fallback:", error);
        return [];
    }
    return data;
}

export const startMatch = async (matchId, veedorId, refereeData) => {
    // refereeData can be { id: '...', name: '...' } or just { name: '...' }

    // 1. Assign Veedor (Always linked)
    if (veedorId) {
        const { error: err1 } = await supabase.from('match_assignments').insert({
            match_id: matchId,
            official_id: veedorId,
            role: 'Veedor',
            confirmed_at: new Date().toISOString()
        });
        if (err1) console.error("Error assigning veedor:", err1);
    }

    // 2. Assign Referee (If ID exists)
    if (refereeData.id) {
        const { error: err2 } = await supabase.from('match_assignments').insert({
            match_id: matchId,
            official_id: refereeData.id,
            role: 'Referee',
            confirmed_at: new Date().toISOString()
        });
        if (err2) console.error("Error assigning referee ID:", err2);
    }

    // 3. Update Match Status and Referee Name
    const { data, error: err3 } = await supabase
        .from('matches')
        .update({
            status: 'playing',
            started_at: Date.now(),
            referee_name: refereeData.name,    // Save text name for display
            referee_id: refereeData.id || null // Save ID if available
        })
        .eq('id', matchId)
        .select()
        .single();

    if (err3) throw new Error("Error de BD (Iniciar Partido): " + err3.message);
    return data;
}

export const getOfficials = async () => {
    const { data, error } = await supabase
        .from('officials')
        .select('*');
    if (error) throw error;
    return data;
}

export const getTeamStaff = async () => {
    const { data, error } = await supabase
        .from('team_staff')
        .select('*, team:teams(name, color)');
    if (error) throw error;
    return data;
}

export const updatePlayer = async (id, updates) => {
    const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export const updateOfficial = async (id, updates) => {
    const { data, error } = await supabase
        .from('officials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export const updateTeam = async (id, updates) => {
    // Separate team updates from player updates? 
    // Usually 'updates' here refers to team fields like logo_url
    const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ----------------------------------------------------
// SISTEMA DE VOTACIONES (POLLS)
// ----------------------------------------------------

export const getPolls = async () => {
    const { data: polls, error } = await supabase
        .from('polls')
        .select(`
            *,
            options:poll_options(*)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return polls;
}

// Check which polls the user has already voted in (for UI state)
// Only returns the poll_ids, NOT what they voted for (maintain client-side anonymity too)
export const getUserParticipations = async (userId) => {
    const { data, error } = await supabase
        .from('poll_participations')
        .select('poll_id')
        .eq('user_id', userId);

    if (error) {
        console.warn("Error checking participations:", error);
        return [];
    }
    // Return array of poll IDs
    return data.map(p => p.poll_id);
}

export const createPoll = async (pollData) => {
    // 1. Create Poll
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
            title: pollData.title,
            description: pollData.description,
            status: 'open'
        })
        .select()
        .single();

    if (pollError) throw pollError;

    // 2. Create Options
    const optionsToInsert = pollData.options.map(opt => ({
        poll_id: poll.id,
        label: opt,
        votes: 0
    }));

    const { error: optError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

    if (optError) throw optError;
    return poll;
}

export const votePoll = async (pollId, optionId, userId) => {
    // Note: In a real production app with high concurrency, you'd use a stored procedure (RPC)
    // to handle the check-and-insert transaction atomically.
    // Here we do checks client-side for simplicity, but RLS on 'insert' should enforce uniqueness too.

    // 1. Record Participation (Prevent double voting)
    const { error: partError } = await supabase
        .from('poll_participations')
        .insert({
            poll_id: pollId,
            user_id: userId
        });

    if (partError) {
        if (partError.code === '23505') { // Unique violation
            throw new Error("Ya votaste en esta encuesta.");
        }
        throw partError;
    }

    // 2. Increment Vote Count (RPC is best for atomic increment)
    // We'll use a specific rpc if available, or a raw SQL, or fetch-update loop.
    // For simplicity without custom SQL functions, we will rely on client-side increment (optimistic)
    // but ideally we should use: await supabase.rpc('increment_vote', { option_id: optionId })

    // Trying direct update (race condition possible but acceptable for demo)
    const { data: option } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();

    if (option) {
        await supabase
            .from('poll_options')
            .update({ votes: option.votes + 1 })
            .eq('id', optionId);
    }
}

export const closePoll = async (pollId) => {
    const { error } = await supabase
        .from('polls')
        .update({ status: 'closed' })
        .eq('id', pollId);

    if (error) throw error;
}

export const getAllowedUsers = async () => {
    const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .order('assigned_role', { ascending: true });

    if (error) {
        console.warn("Error fetching allowed users:", error);
        return [];
    }
    return data;
}
