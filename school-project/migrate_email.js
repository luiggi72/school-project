const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const schemaPath = path.join(__dirname, 'email_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('Running email migration...');

// Split queries by semicolon to run them one by one if needed, or just run as one block if driver supports it.
// mysql2 usually supports multiple statements if configured, but safe way is one by one or just try.
// For ALTER TABLE, it's one statement. The UPDATE is another.
// Let's try splitting.

const queries = schemaSql.split(';').filter(q => q.trim() !== '');

function runQueries(index) {
    if (index >= queries.length) {
        console.log('Email migration completed.');
        process.exit(0);
        return;
    }
    const query = queries[index];
    db.query(query, (err, result) => {
        if (err) {
            // Ignore error if column already exists (duplicate column name)
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column email already exists, skipping.');
            } else {
                console.error('Error running query:', err.message);
            }
        } else {
            console.log('Query executed successfully.');
        }
        runQueries(index + 1);
    });
}

runQueries(0);
