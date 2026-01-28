const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function checkUser(email) {
    return new Promise((resolve, reject) => {
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/user_roles?email=eq.${email}&select=*`;
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

async function searchAllowedXavier() {
    return new Promise((resolve, reject) => {
        const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/allowed_users?full_name=ilike.*xavier*&select=*`;
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
        const roles = await checkUser('xavier.intriago@gmail.com');
        console.log('User roles for Xavier:', JSON.stringify(roles, null, 2));
        const whitelist = await searchAllowedXavier();
        console.log('Whitelist entries for Xavier:', JSON.stringify(whitelist, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
