const db = require('../config/db');

async function inspectStudentData() {
    console.log('--- Inspecting Student Data for FAM-7DDLQ ---');

    db.query("SELECT * FROM students WHERE family_id = 'FAM-7DDLQ'", (err, results) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        if (results.length === 0) {
            console.log('No students found for this family ID.');
        } else {
            console.log('Found student:', results[0]);
            console.log('Keys:', Object.keys(results[0]));
        }
        process.exit(0);
    });
}

inspectStudentData();
