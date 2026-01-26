const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function testUpdate(id, nickname) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ nickname });
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/team_staff?id=eq.${id}`;
        const options = {
            method: 'PATCH',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation,count=exact'
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                console.log('Headers:', res.headers);
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

(async () => {
    try {
        const res = await testUpdate(1, 'Xavi Test');
        console.log('Update Result:', JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
