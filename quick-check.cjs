require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
    const { count, error } = await supabase.from('allowed_users').select('*', { count: 'exact', head: true });
    console.log('Count allowed_users:', count);
    if (error) console.error('Error:', error);

    const { data: roles } = await supabase.from('user_roles').select('*');
    console.log('User roles:', roles.map(r => `${r.email}: ${r.role}`));
}

checkCount();
