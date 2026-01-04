const db = require('./config/db');

async function checkSchools() {
    const query = "SELECT DISTINCT previous_school FROM inquiries WHERE previous_school IS NOT NULL AND previous_school != ''";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Schools found:', results);
        process.exit(0);
    });
}

checkSchools();
