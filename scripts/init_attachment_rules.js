const db = require('../config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS attachment_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    grade_condition VARCHAR(100) NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

console.log('Initializing database table for Smart Attachments...');

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Table `attachment_rules` created or already exists.');
    console.log(result);
    process.exit(0);
});
