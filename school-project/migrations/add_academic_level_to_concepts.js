const db = require('../config/db');

console.log('Running migration: Add academic_level to payment_concepts...');

const query = "ALTER TABLE payment_concepts ADD COLUMN academic_level VARCHAR(50) DEFAULT 'GENERAL' AFTER name";

db.query(query, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column academic_level already exists. Skipping.');
        } else {
            console.error('Error adding column:', err.message);
        }
    } else {
        console.log('Column academic_level added successfully.');
    }
    process.exit();
});
