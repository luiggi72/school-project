const db = require('./config/db');

setTimeout(() => {
    console.log('Checking connection...');
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            console.error('Connection failed:', err.message);
            process.exit(1);
        }
        console.log('Connection successful. Solution:', results[0].solution);
        process.exit(0);
    });
}, 1000);
