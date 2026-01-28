const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function checkProfileColumns() {
    return new Promise((resolve, reject) => {
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/profiles?select=*&limit=1`;
        const options = {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'count=exact'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    // We check the keys of the first record if it exists, or use the OpenAPI spec
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
        const specUrl = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/`;
        const options = {
            method: 'GET',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        };
        https.get(specUrl, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const spec = JSON.parse(data);
                console.log('Columnas en profiles:', Object.keys(spec.definitions.profiles.properties));
            });
        });
    } catch (e) {
        console.error(e);
    }
})();
