const db = require('./config/db');

const updateTable = async () => {
    try {
        const queries = [
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS commercial_name VARCHAR(100)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS street VARCHAR(100)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS exterior_number VARCHAR(20)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
            "ALTER TABLE school_info ADD COLUMN IF NOT EXISTS state VARCHAR(100)",
            "ALTER TABLE school_info MODIFY COLUMN phone TEXT"
        ];

        for (const query of queries) {
            await db.promise().query(query);
            console.log('Query executed:', query);
        }

        console.log('school_info table updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating table:', error);
        process.exit(1);
    }
};

updateTable();
