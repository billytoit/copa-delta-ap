const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

async function checkEmails(emails) {
    const results = {};
    for (const email of emails) {
        results[email] = await new Promise((resolve, reject) => {
            const url = `https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/profiles?email=eq.${email}&select=*`;
            const options = {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            };
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', (d) => data += d);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }
    return results;
}

(async () => {
    try {
        const emails = ['diego.aurea@gmail.com', 'diego.aurea@me.com'];
        const results = await checkEmails(emails);
        console.log('Profiles found:', JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
