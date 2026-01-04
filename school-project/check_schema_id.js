require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_db'
    });

    try {
        const [rows] = await db.execute('DESCRIBE students');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

checkSchema();
