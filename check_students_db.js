const db = require('./config/db');

console.log('Checking Students Table...');

db.query('SELECT COUNT(*) as count FROM students', (err, results) => {
    if (err) {
        console.error('Database Error:', err);
        process.exit(1);
    }
    console.log('Total Students in DB:', results[0].count);

    if (results[0].count > 0) {
        db.query('SELECT id, name, lastnameP FROM students LIMIT 3', (err, rows) => {
            console.log('Sample Data:', rows);
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});
