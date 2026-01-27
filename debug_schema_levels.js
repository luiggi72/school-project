require('dotenv').config();
const db = require('./config/db');

function inspectSchema() {
    // 1. Check one student's 'grade' value
    db.query("SELECT grade, group_name FROM students LIMIT 1", (err, students) => {
        if (err) console.error(err);
        else console.log('Student sample:', students[0]);

        // 2. Check grades table structure
        db.query("SELECT * FROM grades LIMIT 1", (err, grades) => {
            if (err) {
                // Table might not exist or be named differently
                console.log('Error querying grades table (might not exist):', err.message);
            } else if (grades.length > 0) {
                console.log('Grade sample:', grades[0]);
                console.log('Grade columns:', Object.keys(grades[0]));
            } else {
                console.log('Grades table is empty');
            }
            process.exit();
        });
    });
}

inspectSchema();
