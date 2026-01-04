const db = require('./config/db');

console.log('Attempting to add missing columns to students table...');

const queries = [
    "ALTER TABLE students ADD COLUMN birthdate DATE;",
    "ALTER TABLE students ADD COLUMN curp VARCHAR(18);",
    "ALTER TABLE students ADD COLUMN gender CHAR(1);"
];

let completed = 0;

queries.forEach(query => {
    db.query(query, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log('Column already exists.');
            } else {
                console.error('Error executing query:', err.message);
            }
        } else {
            console.log('Column added successfully.');
        }
        completed++;
        if (completed === queries.length) process.exit();
    });
});
