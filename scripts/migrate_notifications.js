const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const migrationFile = path.join(__dirname, '../migrations/migrate_create_notifications_table.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

// Simple split by semicolon to handle multiple statements if any (though currently our file has 2)
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

const runMigration = async () => {
    console.log('Running migration: migrate_create_notifications_table.sql');
    for (const statement of statements) {
        await new Promise((resolve, reject) => {
            db.query(statement, (err, result) => {
                if (err) {
                    console.error('Error running statement:', statement);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
    console.log('Migration completed successfully.');
    process.exit(0);
};

runMigration().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
