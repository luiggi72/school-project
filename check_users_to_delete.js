const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db'
};

async function checkUsers() {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT id, username, email, role, linked_family_id FROM users WHERE email IN (?, ?)', ['lnh72@hotmail.com', 'luis.nachon@hotmail.com']);
    console.log(rows);
    await conn.end();
}

checkUsers();
