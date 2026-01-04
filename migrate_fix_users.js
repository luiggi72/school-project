const db = require('./config/db');

console.log('Attempting to add missing profile column...');

const query = "ALTER TABLE users ADD COLUMN profile VARCHAR(100);";

db.query(query, (err, result) => {
    if (err) {
        // Error code 1060: Duplicate column name
        if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
            console.log('Column "profile" already exists. No changes needed.');
        } else {
            console.error('Error adding column:', err.message);
        }
    } else {
        console.log('Column "profile" added successfully.');
    }
    process.exit();
});
