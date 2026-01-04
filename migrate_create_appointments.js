const db = require('./config/db');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        description TEXT,
        google_event_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating appointments table:', err);
        process.exit(1);
    } else {
        console.log('Appointments table created successfully.');
        process.exit(0);
    }
});
