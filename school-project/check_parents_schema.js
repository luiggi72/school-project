const db = require('./config/db');

db.query('DESCRIBE student_parents', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.table(results);
    }
    process.exit();
});
