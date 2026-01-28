require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log('--- Verificando Roles y Vinculaciones ---');

    // 1. Verificar Whitelist
    const { data: whitelist } = await supabase.from('allowed_users').select('*');
    console.log('\nWhitelist (allowed_users):');
    whitelist.forEach(u => {
        console.log(`- ${u.email}: ${u.assigned_role} (${u.assigned_team_name || 'Sin equipo'})`);
    });

    // 2. Verificar Roles de Usuario Reales
    const { data: roles } = await supabase.from('user_roles').select('*');
    console.log('\nRoles Asignados (user_roles):');
    roles.forEach(r => {
        console.log(`- ${r.email}: ${r.role}`);
    });

    // 3. Verificar Vinculaciones de Staff (Dirigentes)
    const { data: staff } = await supabase.from('team_staff').select('name, email, role, team:teams(name)');
    console.log('\nVinculaciones Staff (team_staff):');
    staff.forEach(s => {
        console.log(`- ${s.name} (${s.email}): ${s.role} en ${s.team?.name}`);
    });

    // 4. Verificar Vinculaciones de Officials (Veedores)
    const { data: officials } = await supabase.from('officials').select('name, id');
    console.log('\nVinculaciones Officials (officials):');
    officials.forEach(o => {
        console.log(`- ${o.name} (ID: ${o.id.substring(0, 8)}...)`);
    });
}

checkRoles();
