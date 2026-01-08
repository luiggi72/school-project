const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db'
};

console.log('Connecting to:', dbConfig.host, dbConfig.database);

const connection = mysql.createConnection(dbConfig);

connection.query('SELECT * FROM academic_levels', (err, results) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log('Row Count:', results.length);
        console.log('First Row:', results[0]);
        console.log('All Names:', results.map(r => r.name));
    }
    connection.end();
});
