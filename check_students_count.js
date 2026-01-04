require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkStudents() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_db'
    });

    try {
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM students');
        console.log('Student count in DB:', rows[0].count);

        if (rows[0].count > 0) {
            const [data] = await db.execute('SELECT * FROM students LIMIT 1');
            console.log('Sample student:', data[0]);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

checkStudents();
