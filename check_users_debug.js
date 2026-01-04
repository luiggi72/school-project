const db = require('./config/db');

const query = 'SELECT * FROM users';

db.query(query, (err, results) => {
    if (err) {
        console.error('Error querying users:', err);
        process.exit(1);
    } else {
        console.log('Users found:', results.length);
        console.log(results);
        process.exit(0);
    }
});
