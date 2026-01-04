const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db'
};

async function deleteUsers() {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.query('DELETE FROM users WHERE id IN (?, ?)', [27, 28]);
    console.log(`Deleted ${result.affectedRows} users.`);
    await conn.end();
}

deleteUsers();
