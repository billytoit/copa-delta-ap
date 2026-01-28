const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function checkAuthUser() {
    return new Promise((resolve, reject) => {
        // We can't query auth.users directly via REST anon key easily without admin privileges,
        // but we can query public.profiles which is linked to auth.users.
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/profiles?email=eq.xavier.intriago@gmail.com&select=*`;
        const options = {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

(async () => {
    try {
        const profiles = await checkAuthUser();
        console.log('Profiles found for Xavier:', JSON.stringify(profiles, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
