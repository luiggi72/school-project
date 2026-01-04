const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');

    const query = `SHOW CREATE TABLE payment_concepts`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log(results[0]['Create Table']);
        }
        db.end();
    });
});
