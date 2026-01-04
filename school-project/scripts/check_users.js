const db = require('../config/db');

db.query("SELECT id, username, email, role, linked_family_id FROM users ORDER BY id DESC LIMIT 5", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.table(results);
    process.exit(0);
});
