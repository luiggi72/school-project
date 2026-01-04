const db = require('./config/db');

db.query('SELECT * FROM payment_concepts', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Concepts in DB:', results);
    }
    process.exit();
});
