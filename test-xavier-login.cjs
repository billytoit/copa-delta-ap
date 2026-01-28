require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const email = 'xavier.intriago@gmail.com';
    const password = 'DIRIGENTE'; // From user screenshot

    console.log(`Testing login for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.log('Login Error:', error.message);
        console.log('Error Code:', error.status);
    } else {
        console.log('Login Success! Session User Type:', data.user.aud);
    }
}

testLogin();
