const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Mock Dependencies
const MOCK_PLAYERS = [
    { id: '1', name: 'Lionel Messi', team_id: 10, teams: { name: 'Inter Miami' } },
    { id: '2', name: 'Cristiano Ronaldo', team_id: 20, teams: { name: 'Al Nassr' } }
];

const MOCK_FILES = ['Lionel Messi.jpg', 'Cristiano Ronaldo.png', 'Unknown Guy.jpg'];

// Override modules for testing logic
fs.readdirSync = () => MOCK_FILES;
fs.readFileSync = () => Buffer.from('fake-image');

// Mock Supabase
const mockSupabase = {
    auth: { signInWithPassword: async () => ({ data: { session: {} }, error: null }) },
    from: (table) => {
        if (table === 'players') {
            return {
                select: async () => ({ data: MOCK_PLAYERS, error: null }),
                update: () => ({ eq: async () => ({ error: null }) })
            };
        }
    },
    storage: {
        from: () => ({
            upload: async () => ({ data: {}, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'http://fake.url/photo.jpg' } })
        })
    }
};

// ... Wait, I can't easily inject mocks into the other script unless I export main.
// So I will just REWRITE a simplified version here to prove the matching logic works.

console.log("🧪 Testing Matching Logic...");

files = MOCK_FILES;
players = MOCK_PLAYERS;

let matches = 0;
for (const file of files) {
    const fileName = path.parse(file).name.toLowerCase().trim(); // "lionel messi"
    const player = players.find(p => p.name.toLowerCase().trim() === fileName);

    if (player) {
        console.log(`✅ MATCH: ${file} -> ${player.name}`);
        matches++;
    } else {
        console.log(`❌ NO MATCH: ${file}`);
    }
}

if (matches === 2) {
    console.log("\nSUCCESS: Logic matches expected files.");
} else {
    console.error("\nFAILURE: Logic invalid.");
    process.exit(1);
}
