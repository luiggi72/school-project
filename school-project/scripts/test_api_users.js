const fetch = require('node-fetch'); // Assuming node-fetch is available, or use http
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET',
    headers: {
        'x-user-role': 'admin' // Simulate admin to pass permission check
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const users = JSON.parse(data);
            if (Array.isArray(users) && users.length > 0) {
                console.log('Sample User Keys:', Object.keys(users[0]));
                console.log('Sample User Data:', users.find(u => u.username === 'Luis Fernando'));
            } else {
                console.log('No users found or error:', data);
            }
        } catch (e) {
            console.error('Parse error:', e, data);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
