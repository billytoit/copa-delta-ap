const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function verifyXavierWhitelist() {
    return new Promise((resolve, reject) => {
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/allowed_users?email=eq.xavier.intriago@gmail.com&select=*`;
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
        const result = await verifyXavierWhitelist();
        if (result && result.length > 0) {
            console.log('✅ Xavier ya está en la whitelist:', JSON.stringify(result[0], null, 2));
        } else {
            console.log('❌ Xavier aún no aparece en la whitelist. ¿Ya ejecutaste el SQL?');
        }
    } catch (e) {
        console.error('Error verificando:', e);
    }
})();
