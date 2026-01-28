const db = require('../config/db');

const query = 'SELECT id, email, role FROM users';

db.query(query, (err, results) => {
    if (err) {
        console.error('Error fetching users:', err);
        process.exit(1);
    }
    console.log('--- User Roles in DB ---');
    results.forEach(u => {
        console.log(`User: ${u.email}, Role: "${u.role}"`);
    });
    console.log('------------------------');
    process.exit(0);
});
