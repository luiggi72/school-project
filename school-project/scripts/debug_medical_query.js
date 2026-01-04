const db = require('../config/db');

const studentId = 'TRNV-U0ZA9';

console.log('--- Testing Database Query for ID:', studentId, '---');

const query = `
    SELECT mr.*, s.birthdate 
    FROM medical_records mr 
    JOIN students s ON mr.student_id = s.id 
    WHERE mr.student_id = ? `;

db.query(query, [studentId], (err, results) => {
    if (err) {
        console.error('Main Query Error:', err);
    } else {
        console.log('Main Query Results:', results);
        if (results.length === 0) {
            console.log('Main query empty. Trying fallback...');
            const fallback = 'SELECT birthdate FROM students WHERE id = ?';
            db.query(fallback, [studentId], (err2, res2) => {
                if (err2) console.error('Fallback Error:', err2);
                else {
                    console.log('Fallback Results:', res2);
                }
                process.exit();
            });
        } else {
            process.exit();
        }
    }
});
