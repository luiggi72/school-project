const db = require('./config/db');

const addFamilyIdColumn = async () => {
    try {
        const query = `
            ALTER TABLE students
            ADD COLUMN family_id VARCHAR(50) DEFAULT NULL;
        `;

        db.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column family_id already exists in students table.');
                } else {
                    console.error('Error adding family_id column:', err);
                }
            } else {
                console.log('Successfully added family_id column to students table.');
            }
            process.exit();
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        process.exit(1);
    }
};

addFamilyIdColumn();
