const db = require('./config/db');

db.query('SELECT * FROM users', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results);
    }
    process.exit();
});
