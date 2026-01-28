const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function deepCheckEmail(email) {
    const tables = ['allowed_users', 'profiles', 'user_roles', 'team_staff'];
    const results = {};

    for (const table of tables) {
        results[table] = await new Promise((resolve) => {
            const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/${table}?email=eq.${email}&select=*`;
            const options = {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            };
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve({ error: e.message }); } });
            }).on('error', (e) => resolve({ error: e.message }));
        });
    }
    return results;
}

(async () => {
    const email = 'xavier.intriago@gmail.com';
    console.log(`--- Diagnóstico para: ${email} ---`);
    const report = await deepCheckEmail(email);
    console.log(JSON.stringify(report, null, 2));
})();
