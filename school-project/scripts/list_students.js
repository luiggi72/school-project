const db = require('../config/db');

db.query("SELECT id, name, lastnameP, lastnameM, family_id FROM students LIMIT 20", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.table(results);
    process.exit(0);
});
