
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db',
    socketPath: process.env.DB_SOCKET_PATH,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function deleteUser() {
    try {
        console.log('Deleting user luis.nachon@hotmail.com...');
        const [result] = await pool.promise().query('DELETE FROM users WHERE email = ?', ['luis.nachon@hotmail.com']);
        console.log('Deleted rows:', result.affectedRows);

        // Also delete lnh72 if present
        const [result2] = await pool.promise().query('DELETE FROM users WHERE email = ?', ['lnh72@hotmail.com']);
        console.log('Deleted lnh72 rows:', result2.affectedRows);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteUser();
