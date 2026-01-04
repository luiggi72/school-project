const db = require('./config/db');

const createPaymentsTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL,
        concept VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
`;

db.query(createPaymentsTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating payments table:', err);
    } else {
        console.log('Payments table created or already exists.');
    }
    process.exit();
});
