const db = require('../config/db');

const addPushTokenColumn = async () => {
    try {
        const query = `
            ALTER TABLE users
            ADD COLUMN push_token VARCHAR(255) DEFAULT NULL;
        `;

        db.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column push_token already exists in users table.');
                } else {
                    console.error('Error adding push_token column:', err);
                }
            } else {
                console.log('Successfully added push_token column to users table.');
            }
            process.exit();
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        process.exit(1);
    }
};

addPushTokenColumn();
