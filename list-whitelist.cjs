require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllEmails() {
    const { data: allowed } = await supabase.from('allowed_users').select('*');
    console.log('Whitelist Emails:');
    allowed.forEach(u => {
        console.log(`|${u.email}| (Length: ${u.email.length})`);
    });
}

checkAllEmails();
