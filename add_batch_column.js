const db = require('./config/db');

// Add batch_id column if it doesn't exist
const query = "ALTER TABLE user_notifications ADD COLUMN batch_id VARCHAR(50) DEFAULT NULL";
const indexQuery = "CREATE INDEX idx_batch_id ON user_notifications(batch_id)";

db.query(query, [], (err, result) => {
    if (err) {
        // Ignore if valid error (like duplicate column), but log it
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column batch_id already exists.');
        } else {
            console.error('Error adding column:', err);
            process.exit(1);
        }
    } else {
        console.log('Added batch_id column.');
    }

    // Try creating index
    db.query(indexQuery, [], (err, res) => {
        if (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('Index already exists.');
            } else {
                console.warn('Index error (might exist):', err.message);
            }
        } else {
            console.log('Index created.');
        }
        process.exit(0);
    });
});
