const mysql = require('mysql2');
const dbConfig = require('../config/db').config; // Access connection config directly if possible, or create new

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_db'
});

const alterTableQuery = `
    ALTER TABLE payments
    ADD COLUMN codi_transaction_id VARCHAR(100) NULL,
    ADD COLUMN codi_status ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'FAILED') DEFAULT NULL;
`;

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to DB:', err);
        return;
    }
    console.log('Connected to database.');

    connection.query(alterTableQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist.');
            } else {
                console.error('Error executing migration:', err);
            }
        } else {
            console.log('Migration successful: CoDi fields added.');
        }
        connection.end();
        process.exit();
    });
});
