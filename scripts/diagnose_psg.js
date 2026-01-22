import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('name', 'Paris%');

    if (error) console.error(error);
    else console.log('Teams found:', data);

    // Also check exact string from data.js
    const exactName = 'Paris Saint‑Germain'; // with non-breaking hyphen
    console.log(`Checking exact match for: "${exactName}" (Char codes: ${exactName.charCodeAt(11)})`);

    const { data: exact, error: exactErr } = await supabase
        .from('teams')
        .select('*')
        .eq('name', exactName);

    if (exactErr) console.error(exactErr);
    else console.log('Exact matches:', exact);
}

check();
