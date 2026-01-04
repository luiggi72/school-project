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

    const dropQuery = "ALTER TABLE payment_concepts DROP INDEX name";
    const addQuery = "ALTER TABLE payment_concepts ADD UNIQUE INDEX name_level_unique (name, academic_level)";

    db.query(dropQuery, (err, result) => {
        if (err) {
            console.error('Error dropping index:', err);
        } else {
            console.log('Dropped unique index on name');
        }

        db.query(addQuery, (err, result) => {
            if (err) {
                console.error('Error adding composite index:', err);
            } else {
                console.log('Added unique composite index on (name, academic_level)');
            }
            db.end();
        });
    });
});
