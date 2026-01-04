const http = require('http');

const data = JSON.stringify({
    username: 'Luis Fernando',
    email: 'luis.nachon@hotmail.com', // Keep existing
    role: 'tutor',
    profile: 'Padre',
    linked_family_id: 'FAM-7ZBU9' // The value we want!
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/25', // Targeting ID 25
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'x-user-role': 'admin'
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
