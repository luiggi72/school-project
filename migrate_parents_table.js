const db = require('./config/db');

console.log('Creating student_parents table...');

const query = `
CREATE TABLE IF NOT EXISTS student_parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    type ENUM('MOTHER', 'FATHER', 'TUTOR') NOT NULL,
    name VARCHAR(100),
    lastnameP VARCHAR(100),
    lastnameM VARCHAR(100),
    birthdate DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    street VARCHAR(100),
    exterior_number VARCHAR(20),
    neighborhood VARCHAR(100),
    zip_code VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    UNIQUE KEY unique_parent (student_id, type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
`;

db.query(query, (err, result) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table student_parents created successfully.');
    }
    process.exit();
});
