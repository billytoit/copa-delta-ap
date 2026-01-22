import { createClient } from '@supabase/supabase-js';
import { GROUPS, TEAMS_2026 } from '../src/data.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Note: In a real scenario, we might need SERVICE_ROLE_KEY to bypass RLS if we are not authenticated as admin.
// For now we assume Anon key + RLS policies allow "insert" if we were logged in, OR we temporarily disable RLS,
// OR we use the Service Role Key if available.
// Since the user probably doesn't have the service key in .env (usually safer), we might need to rely on the user running the SQL manually first,
// and then WE need a way to insert.
// Actually, RLS usually blocks ANON inserts.
// Hack for this script: We will try to use the ANON key but if it fails due to RLS, the user might need to temporarily disable RLS on 'groups' or add a policy for anon insert.
// BETTER: The user executes this script locally.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting migration...');

    for (const group of GROUPS) {
        console.log(`Processing ${group.name}...`);

        // 1. Insert Group
        // Check if exists first to be idempotent
        let groupId;
        const { data: existingGroup } = await supabase.from('groups').select('id').eq('name', group.name).single();

        if (existingGroup) {
            groupId = existingGroup.id;
            console.log(`  Group ${group.name} already exists (ID: ${groupId})`);
        } else {
            const { data: newGroup, error: groupError } = await supabase
                .from('groups')
                .insert({ name: group.name })
                .select()
                .single();

            if (groupError) {
                console.error(`  Error creating group ${group.name}:`, groupError.message);
                continue;
            }
            groupId = newGroup.id;
            console.log(`  Created Group ${group.name} (ID: ${groupId})`);
        }

        // 2. Update Teams
        for (const teamId of group.teams) {
            // Find the team name in data.js to match against DB if IDs differ?
            // Assuming DB IDs for teams match data.js IDs (1 to 18)?
            // Creating teams usually assigns UUIDs unless we manually forced IDs.
            // Let's check how teams were created. If they have UUIDs, we need to match by NAME.

            const teamData = TEAMS_2026.find(t => t.id === teamId);
            if (!teamData) {
                console.warn(`  Warning: Team ID ${teamId} not found in TEAMS_2026`);
                continue;
            }

            // Find team in DB by name
            const { data: dbTeam, error: findError } = await supabase
                .from('teams')
                .select('id')
                .eq('name', teamData.name)
                .single();

            if (findError || !dbTeam) {
                console.error(`  Error finding team ${teamData.name} in DB:`, findError?.message || 'Not found');
                continue;
            }

            // Update team with group_id
            const { error: updateError } = await supabase
                .from('teams')
                .update({ group_id: groupId })
                .eq('id', dbTeam.id);

            if (updateError) {
                console.error(`  Error linking team ${teamData.name} to group:`, updateError.message);
            } else {
                console.log(`  Linked ${teamData.name} to ${group.name}`);
            }
        }
    }
    console.log('Migration finished.');
}

migrate();
