const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Split queries by semicolon, filtering out empty lines
const queries = schemaSql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

console.log(`Found ${queries.length} queries to execute.`);

// Execute queries sequentially
async function runMigrations() {
    for (const query of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('Executed query successfully.');
        } catch (err) {
            // Ignore "database exists" or "table exists" errors if you want, 
            // but for now let's log them.
            console.error('Error executing query:', err.message);
        }
    }
    console.log('Migration completed.');
    process.exit(0);
}

runMigrations();
