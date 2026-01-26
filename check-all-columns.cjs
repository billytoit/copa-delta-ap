const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function getColumns(table) {
    return new Promise((resolve, reject) => {
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/${table}?limit=0`;
        const options = {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'count=exact'
            }
        };

        https.get(url, options, (res) => {
            // We just need the headers or a sample to see columns if we can't use RPC
            // Actually, a better way is to request a single row and see keys
            const url2 = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/${table}?limit=1`;
            https.get(url2, options, (res2) => {
                let data = '';
                res2.on('data', (chunk) => { data += chunk; });
                res2.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.length > 0) {
                            resolve(Object.keys(json[0]));
                        } else {
                            resolve([]);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }).on('error', reject);
    });
}

(async () => {
    try {
        const playersCols = await getColumns('players');
        console.log('Players columns:', playersCols);
        const profilesCols = await getColumns('profiles');
        console.log('Profiles columns:', profilesCols);
        const staffCols = await getColumns('team_staff');
        console.log('Staff columns:', staffCols);
    } catch (e) {
        console.error(e);
    }
})();
