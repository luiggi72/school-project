const db = require('./config/db');

// Simple query to get table info
const query = "DESCRIBE user_notifications";

db.query(query, [], (err, results) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Schema:', results);
    }
    process.exit();
});
