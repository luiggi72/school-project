const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_db'
};

async function inspectSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Check USERS table for linked_family_id
        console.log('\n--- Table: users ---');
        const [usersCols] = await connection.query(`DESCRIBE users`);
        const familyIdCol = usersCols.find(c => c.Field === 'linked_family_id');
        console.log(usersCols.map(c => `${c.Field} (${c.Type})`).join('\n'));

        if (familyIdCol) {
            console.log('\n✅ ' + 'users table HAS linked_family_id');
        } else {
            console.log('\n❌ ' + 'users table MISSING linked_family_id');
        }

        // 2. Check STUDENTS table for family_id and parent names
        console.log('\n--- Table: students ---');
        const [studentsCols] = await connection.query(`DESCRIBE students`);
        console.log(studentsCols.map(c => `${c.Field} (${c.Type})`).join('\n'));

        // 3. Check student_parents table existence
        console.log('\n--- Table: student_parents ---');
        try {
            const [parentsCols] = await connection.query(`DESCRIBE student_parents`);
            console.log(parentsCols.map(c => `${c.Field} (${c.Type})`).join('\n'));
            console.log('\n✅ ' + 'student_parents table EXISTS');
        } catch (e) {
            console.log('\n⚠️ ' + 'student_parents table DOES NOT EXIST (Using legacy columns in students table?)');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

inspectSchema();
