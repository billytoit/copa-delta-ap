require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectXavier() {
    const email = 'xavier.intriago@gmail.com';
    console.log(`Inspecting ${email}...`);

    // 1. Auth & Role
    const { data: authUser } = await supabase.from('profiles').select('id, email, full_name').eq('email', email).maybeSingle();
    const { data: role } = await supabase.from('user_roles').select('*').eq('email', email).maybeSingle();

    console.log('--- Database State ---');
    console.log('Profile:', authUser);
    console.log('Role Table:', role);

    if (authUser) {
        // 2. Player Table
        const { data: player } = await supabase.from('players').select('*, team:teams(name)').eq('profile_id', authUser.id).maybeSingle();
        console.log('Player Record:', player);

        // 3. Staff Table
        const { data: staff } = await supabase.from('team_staff').select('*, team:teams(name)').eq('profile_id', authUser.id).maybeSingle();
        console.log('Staff Record:', staff);

        // 4. Staff by Email (fallback check)
        const { data: staffByEmail } = await supabase.from('team_staff').select('*, team:teams(name)').eq('email', email).maybeSingle();
        console.log('Staff Record (by Email):', staffByEmail);
    }

    // 5. Teams check
    const { data: teams } = await supabase.from('teams').select('id, name').ilike('name', '%Atleti%');
    console.log('Teams matching "Atleti":', teams);
}

inspectXavier();
