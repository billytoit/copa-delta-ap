require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugXavier() {
    console.log('--- Debugging Xavier Sync ---');

    // 1. check allowed_users exactly
    const { data: allowed } = await supabase.from('allowed_users').select('*').eq('email', 'xavier.intriago@gmail.com');
    console.log('Allowed Users Match:', JSON.stringify(allowed, null, 2));

    // 2. check user_roles
    const { data: roles } = await supabase.from('user_roles').select('*').eq('email', 'xavier.intriago@gmail.com');
    console.log('User Roles:', JSON.stringify(roles, null, 2));

    // 3. check profiles
    const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'xavier.intriago@gmail.com');
    console.log('Profiles:', JSON.stringify(profiles, null, 2));
}

debugXavier();
