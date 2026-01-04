const db = require('./config/db');

const createInquiriesTable = `
CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    child_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    requested_grade VARCHAR(100) NOT NULL,
    previous_school VARCHAR(255),
    marketing_source VARCHAR(100) NOT NULL,
    marketing_source_other VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(createInquiriesTable, (err, result) => {
    if (err) {
        console.error('Error creating inquiries table:', err);
    } else {
        console.log('Inquiries table created or exists');
    }
    process.exit();
});
