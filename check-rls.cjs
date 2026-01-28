require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'allowed_users' });
    if (error) {
        // Fallback to direct query if RPC doesn't exist (it likely doesn't)
        console.log('Error checking policies via RPC. Trying manual select...');
        const { data: testSelect, error: selectError } = await supabase.from('allowed_users').select('*').limit(1);
        console.log('Select Result:', testSelect);
        console.log('Select Error:', selectError);
    } else {
        console.log('Policies:', data);
    }
}

checkRLS();
