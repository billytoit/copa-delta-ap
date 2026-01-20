const https = require('https');

// Use the exact key from the user's .env
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaWNmbXVra2p4cHdwcWhkdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTExOTgsImV4cCI6MjA4NDA2NzE5OH0.EtGKUHZlZV-AZy7tE0sUDuqPn0eSwHLQQRhUOm6BRWY';
const url = 'https://apicfmukkjxpwpqhdvos.supabase.co/rest/v1/matches?id=eq.1';

// Try to update the match status. If RLS is blocking, this will return [] (0 rows).
const data = JSON.stringify({ status: 'playing' });

const options = {
    method: 'PATCH',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // This asks Supabase to return the modified rows
    }
};

const req = https.request(url, options, (res) => {
    console.log('HTTP Status:', res.statusCode);
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Raw Response:', responseData);
        try {
            const json = JSON.parse(responseData);
            if (Array.isArray(json) && json.length === 0) {
                console.log("\n>>> DIAGNOSIS: 0 rows updated. RLS Policy is BLOCKING the update.");
            } else if (Array.isArray(json) && json.length > 0) {
                console.log("\n>>> DIAGNOSIS: Update SUCCESSFUL. Rows updated: " + json.length);
            } else {
                console.log("\n>>> DIAGNOSIS: Unknown response format.");
            }
        } catch (e) {
            console.log("Error parsing JSON:", e);
        }
    });
});

req.on('error', (err) => {
    console.log('Network Error:', err.message);
});

req.write(data);
req.end();
