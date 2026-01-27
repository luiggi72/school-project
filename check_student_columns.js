require('dotenv').config();
const db = require('./config/db');

function checkColumns() {
    db.query("SELECT * FROM students LIMIT 1", (err, rows) => {
        if (err) {
            console.error(err);
        } else if (rows.length > 0) {
            console.log('Student Columns:', Object.keys(rows[0]));
            // console.log('Sample Data:', rows[0]);
        } else {
            console.log('No students found to inspect.');
        }
        process.exit();
    });
}

checkColumns();
