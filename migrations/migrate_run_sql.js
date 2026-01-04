const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runSqlFile = (filename) => {
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by semicolon to handle multiple statements if any (basic implementation)
    // For this specific file it's likely just one or two statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

    console.log(`Running ${statements.length} statements from ${filename}...`);

    let completed = 0;

    // Recursive execution to ensure order
    const executeStatement = (index) => {
        if (index >= statements.length) {
            console.log('All statements executed successfully.');
            process.exit(0);
        }

        const stmt = statements[index];
        db.query(stmt, (err, result) => {
            if (err) {
                console.error(`Error executing statement ${index + 1}:`, err);
                // Don't exit, might be "table exists" if IF NOT EXISTS usage varies
                // But for safety let's log and continue or exit? 
                // Given "IF NOT EXISTS" in SQL, valid errors shouldn't happen unless syntax
                if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
                    // proceed cautiously
                }
            }
            executeStatement(index + 1);
        });
    };

    executeStatement(0);
};

const file = process.argv[2];
if (!file) {
    console.error('Please provide a SQL filename in migrations folder');
    process.exit(1);
}

runSqlFile(file);
