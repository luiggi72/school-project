const db = require('./config/db');

db.query('DESCRIBE students', (err, results) => {
    if (err) {
        console.error('Error describing students table:', err);
        process.exit(1);
    }
    console.log(results);
    process.exit(0);
});
