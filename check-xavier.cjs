require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkXavier() {
    console.log('--- Checking Xavier ---');
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'xavier.intriago@gmail.com').maybeSingle();
    console.log('Profile:', profile);

    const { data: role } = await supabase.from('user_roles').select('*').eq('email', 'xavier.intriago@gmail.com').maybeSingle();
    console.log('Role:', role);

    const { data: staff } = await supabase.from('team_staff').select('*, team:teams(*)').eq('email', 'xavier.intriago@gmail.com').maybeSingle();
    console.log('Staff:', staff);
}

checkXavier();
