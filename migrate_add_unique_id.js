const db = require('./config/db');

console.log('Attempting to add unique_id column to students table...');

const query = "ALTER TABLE students ADD COLUMN unique_id VARCHAR(12) UNIQUE;";

db.query(query, (err, result) => {
    if (err) {
        // Error code 1060: Duplicate column name
        if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
            console.log('Column "unique_id" already exists. No changes needed.');
        } else {
            console.error('Error adding column:', err.message);
        }
    } else {
        console.log('Column "unique_id" added successfully.');
    }
    process.exit();
});
