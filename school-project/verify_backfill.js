const db = require('./config/db');

db.query('SELECT * FROM student_parents LIMIT 5', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.table(results);
    }
    process.exit();
});
