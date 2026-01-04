const db = require('../config/db');

const createGradesTable = `
CREATE TABLE IF NOT EXISTS student_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score DECIMAL(5, 2),
    period VARCHAR(50) DEFAULT 'General',
    evaluation_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
`;

console.log('Migrating: Creating student_scores table...');

db.query(createGradesTable, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Table student_scores created successfully.');

    // Add some dummy data for testing if empty
    const checkQuery = 'SELECT COUNT(*) as count FROM student_scores';
    db.query(checkQuery, (err, rows) => {
        if (rows[0].count === 0) {
            console.log('Adding dummy grades for existing students...');
            const getStudents = 'SELECT id FROM students LIMIT 5';
            db.query(getStudents, (err, students) => {
                if (students.length === 0) {
                    console.log('No students found to add dummy grades.');
                    process.exit(0);
                }

                const subjects = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés'];
                let pending = students.length * subjects.length;

                students.forEach(student => {
                    subjects.forEach(subject => {
                        const score = (Math.random() * (10 - 6) + 6).toFixed(1); // Random score 6-10
                        const insert = 'INSERT INTO student_scores (student_id, subject, score, period, evaluation_date) VALUES (?, ?, ?, ?, NOW())';
                        db.query(insert, [student.id, subject, score, 'Parcial 1'], (err) => {
                            if (err) console.error(err);
                            pending--;
                            if (pending === 0) {
                                console.log('Dummy grades added.');
                                process.exit(0);
                            }
                        });
                    });
                });
            });
        } else {
            console.log('Table already has data.');
            process.exit(0);
        }
    });
});
