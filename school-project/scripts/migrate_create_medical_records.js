const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: process.env.DB_SOCKET_PATH
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    medications TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    doctor_name VARCHAR(255),
    doctor_phone VARCHAR(50),
    insurance_company VARCHAR(255),
    insurance_policy VARCHAR(255),
    additional_notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student (student_id)
)`;

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');

    connection.query(createTableQuery, (err, results) => {
        if (err) throw err;
        console.log('Medical records table created or already exists.');
        connection.end();
        process.exit();
    });
});
