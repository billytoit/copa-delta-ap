const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Optional: Bypasses Auth

// Args
const PHOTOS_DIR = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');

const BUCKET_NAME = 'player-photos';

// Admin Credentials (if using Anon Key)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@delta.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!PHOTOS_DIR) {
    console.error("Usage: node bulk_upload_photos.cjs <path_to_photos_directory> [--dry-run]");
    console.error("Env vars needed: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY");
    console.error("Optional Env: SUPABASE_SERVICE_ROLE_KEY (Recommended) OR ADMIN_EMAIL + ADMIN_PASSWORD");
    process.exit(1);
}

// Initialize Client
let supabase;

async function main() {
    console.log(`\n🚀 Starting Bulk Upload from: ${PHOTOS_DIR}`);
    if (DRY_RUN) console.log("👀 DRY RUN MODE: No changes will be made.");

    // 1. Auth Strategy
    if (SUPABASE_SERVICE_KEY) {
        console.log("🔑 Using Service Role Key (Bypassing RLS)...");
        supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } else {
        console.log("🔑 Using Anon Key...");
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        if (ADMIN_PASSWORD) {
            console.log(`🔐 Authenticating as ${ADMIN_EMAIL}...`);
            const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            if (authError) {
                console.error("❌ Authentication Failed:", authError.message);
                process.exit(1);
            }
            console.log("✅ Authenticated!");
        } else {
            console.warn("⚠️  No ADMIN_PASSWORD or SERVICE_ROLE_KEY found.");
            console.warn("   Uploads may fail if RLS requires authentication.");
        }
    }

    // 2. Fetch all players
    console.log("📥 Fetching players list...");
    const { data: players, error: fetchError } = await supabase
        .from('players')
        .select('id, name, team_id, teams(name)');

    if (fetchError) {
        console.error("❌ Failed to fetch players:", fetchError.message);
        process.exit(1);
    }
    console.log(`✅ Found ${players.length} players in database.`);

    // 3. Read Files
    let files = [];
    try {
        files = fs.readdirSync(PHOTOS_DIR).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    } catch (e) {
        console.error("❌ Error reading directory:", e.message);
        process.exit(1);
    }
    console.log(`📂 Found ${files.length} images in directory.`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const filePath = path.join(PHOTOS_DIR, file);
        const fileName = path.parse(file).name.toLowerCase().trim(); // "lionel messi"

        // 4. Find Match (Fuzzy-ish)
        const player = players.find(p => {
            const pName = p.name.toLowerCase().trim();
            // 1. Exact Name match
            if (pName === fileName) return true;
            // 2. "First Last" match against "Last, First"? No, file names usually "First Last"
            return false;
        });

        if (!player) {
            console.warn(`⚠️  No match found for file: "${file}" (Ignored)`);
            failCount++;
            continue;
        }

        console.log(`🎯 Match: "${file}" -> ${player.name} (${player.teams?.name})`);

        if (DRY_RUN) {
            successCount++;
            continue;
        }

        try {
            // 5. Upload to Storage
            const fileBuffer = fs.readFileSync(filePath);
            const fileExt = path.parse(file).ext;
            // Naming convention: public/{player_id}_{timestamp}{ext}
            const storagePath = `public/${player.id}_${Date.now()}${fileExt}`;

            process.stdout.write(`   ⬆️ Uploading... `);
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from(BUCKET_NAME)
                .upload(storagePath, fileBuffer, {
                    contentType: `image/${fileExt.replace('.', '')}`,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 6. Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);

            // 7. Update Player Record
            process.stdout.write(`Done.\n   🔗 Linking URL... `);
            const { error: updateError } = await supabase
                .from('players')
                .update({ photo_url: publicUrl })
                .eq('id', player.id);

            if (updateError) throw updateError;

            console.log(`Done.`);
            successCount++;

        } catch (err) {
            console.log(`FAILED.`);
            console.error(`   ❌ Error:`, err.message);
            failCount++;
        }
    }

    console.log(`\n🎉 DONE! Success: ${successCount}, Failed/Skipped: ${failCount}`);
}

main();
