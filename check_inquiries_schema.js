const db = require('./config/db');

db.query('DESCRIBE inquiries', (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(results);
    process.exit(0);
});
