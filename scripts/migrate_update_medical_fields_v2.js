const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: process.env.DB_SOCKET_PATH
});

const alterQuery = `
    ALTER TABLE medical_records
    ADD COLUMN IF NOT EXISTS height VARCHAR(20),
    ADD COLUMN IF NOT EXISTS weight VARCHAR(20),
    ADD COLUMN IF NOT EXISTS doctor_email VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doctor_office VARCHAR(255),
    ADD COLUMN IF NOT EXISTS has_surgeries TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS surgeries_comments TEXT,
    ADD COLUMN IF NOT EXISTS has_medications TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS has_therapy TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS therapy_comments TEXT;
`;

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL');

    connection.query(alterQuery, (err, results) => {
        if (err) {
            console.error('Error altering table:', err);
            connection.end();
            process.exit(1);
        }
        console.log('Medical records table updated successfully.');
        connection.end();
        process.exit();
    });
});
