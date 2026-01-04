const db = require('./config/db');

db.query('SELECT family_id, COUNT(*) as count FROM students GROUP BY family_id HAVING count > 0', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Family ID usage:', results);
    }
    process.exit();
});
