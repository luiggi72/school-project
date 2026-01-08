const db = require('./config/db');

const familyId = 'FAM-30X3V';

async function checkStudents() {
    console.log('Checking students for Family ID:', familyId);
    try {
        const query = 'SELECT * FROM students WHERE family_id = ?';
        const [students] = await db.promise().query(query, [familyId]);
        console.log('Students Found:', students);

        if (students.length === 0) {
            console.log('No students found for this family ID!');
            // Check if student exists but has different/null Family ID
            const [allStudents] = await db.promise().query('SELECT * FROM students');
            console.log('Total Students in DB:', allStudents.length);
            console.log('First 3 Students:', allStudents.slice(0, 3));
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudents();
