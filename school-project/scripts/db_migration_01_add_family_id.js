const db = require('../config/db');

const addColumnQuery = "ALTER TABLE users ADD COLUMN linked_family_id VARCHAR(50) DEFAULT NULL AFTER profile";

db.query("SHOW COLUMNS FROM users LIKE 'linked_family_id'", (err, results) => {
    if (err) {
        console.error('Error checking columns:', err);
        process.exit(1);
    }

    if (results.length > 0) {
        console.log('Column linked_family_id already exists.');
        process.exit(0);
    } else {
        db.query(addColumnQuery, (err, result) => {
            if (err) {
                console.error('Error adding column:', err);
                process.exit(1);
            }
            console.log('Column linked_family_id added successfully.');
            process.exit(0);
        });
    }
});
