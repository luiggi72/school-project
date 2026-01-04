const db = require('./config/db');

db.query('DESCRIBE students', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results.map(col => col.Field).join(', '));
    }
    process.exit();
});
