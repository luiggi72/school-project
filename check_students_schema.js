const db = require('./config/db');

db.query('DESCRIBE students', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Students Table Schema:', results);
    }
    process.exit();
});
