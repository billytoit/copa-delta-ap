const https = require('https');

const url = 'https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/seasons?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';

const options = {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
};

https.get(url, options, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Response:', data);
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
