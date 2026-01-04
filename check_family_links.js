const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db'
};

async function checkRecentUsers() {
    const conn = await mysql.createConnection(dbConfig);
    console.log("Checking recent 'tutor' users...");
    const [rows] = await conn.query('SELECT id, username, email, role, linked_family_id FROM users WHERE role = "tutor" ORDER BY id DESC LIMIT 5');
    console.table(rows);

    console.log("\nChecking a sample student to see their family_id...");
    const [students] = await conn.query('SELECT id, name, family_id FROM students ORDER BY id DESC LIMIT 5');
    console.table(students);

    await conn.end();
}

checkRecentUsers();
