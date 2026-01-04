const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const schemaPath = path.join(__dirname, 'parents_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('Running parents migration...');

db.query(schemaSql, (err, result) => {
    if (err) {
        console.error('Error creating parents table:', err.message);
        process.exit(1);
    }
    console.log('Parents table created successfully.');
    process.exit(0);
});
