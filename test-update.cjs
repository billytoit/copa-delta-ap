const https = require('https');

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';
const url = 'https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/matches?id=eq.1'; // Testing on match ID 1

const data = JSON.stringify({ status: 'playing' });

const options = {
    method: 'PATCH',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
};

const req = https.request(url, options, (res) => {
    console.log('Status Code:', res.statusCode);
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Response:', responseData);
    });
});

req.on('error', (err) => {
    console.log('Error:', err.message);
});

req.write(data);
req.end();
