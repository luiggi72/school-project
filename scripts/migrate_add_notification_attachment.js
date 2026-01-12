const db = require('../config/db');

console.log('Migrating: Adding attachment_url to user_notifications table...');

const query = `
    ALTER TABLE user_notifications
    ADD COLUMN attachment_url VARCHAR(255) NULL AFTER message
`;

db.query(query, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column attachment_url already exists. Skipping.');
        } else {
            console.error('Error adding column:', err);
        }
    } else {
        console.log('Column attachment_url added successfully.');
    }
    process.exit();
});
