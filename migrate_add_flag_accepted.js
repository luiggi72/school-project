const db = require('./config/db');

const addFlagAccepted = async () => {
    try {
        const query = "ALTER TABLE inquiries ADD COLUMN flag_accepted BOOLEAN DEFAULT 0 AFTER flag_evaluation";

        db.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column flag_accepted already exists.');
                } else {
                    console.error('Error adding column:', err);
                }
            } else {
                console.log('Successfully added flag_accepted column to inquiries table.');
            }
            process.exit();
        });
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

addFlagAccepted();
