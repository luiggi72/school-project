const db = require('./config/db');

const createConceptsTableQuery = `
    CREATE TABLE IF NOT EXISTS payment_concepts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        default_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

db.query(createConceptsTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating payment_concepts table:', err);
    } else {
        console.log('Payment concepts table created or already exists.');
    }
    process.exit();
});
