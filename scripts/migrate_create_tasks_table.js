const db = require('../config/db');

const createTasksTable = `
CREATE TABLE IF NOT EXISTS student_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('PENDING', 'COMPLETED', 'LATE') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
`;

console.log('Migrating: Creating student_tasks table...');

db.query(createTasksTable, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Table student_tasks created successfully.');

    // Add some dummy data for testing if empty
    const checkQuery = 'SELECT COUNT(*) as count FROM student_tasks';
    db.query(checkQuery, (err, rows) => {
        if (rows[0].count === 0) {
            console.log('Adding dummy tasks for existing students...');
            const getStudents = 'SELECT id FROM students LIMIT 5';
            db.query(getStudents, (err, students) => {
                if (students.length === 0) {
                    console.log('No students found to add dummy tasks.');
                    process.exit(0);
                }

                const tasks = [
                    { subject: 'Matemáticas', title: 'Ejercicios de Álgebra', desc: 'Resolver páginas 20-22 del libro de texto.', daysOffset: 1 },
                    { subject: 'Historia', title: 'Ensayo Revolución', desc: 'Escribir un ensayo de 2 cuartillas sobre la Revolución Mexicana.', daysOffset: 3 },
                    { subject: 'Ciencias', title: 'Maqueta del Sistema Solar', desc: 'Traer materiales para construir la maqueta en clase.', daysOffset: 5 },
                    { subject: 'Inglés', title: 'Verbos Irregulares', desc: 'Memorizar la lista de los primeros 20 verbos irregulares.', daysOffset: 2 }
                ];

                let pending = students.length * tasks.length;

                students.forEach(student => {
                    tasks.forEach(task => {
                        const dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + task.daysOffset);

                        const insert = 'INSERT INTO student_tasks (student_id, subject, title, description, due_date, status) VALUES (?, ?, ?, ?, ?, ?)';
                        db.query(insert, [student.id, task.subject, task.title, task.desc, dueDate, 'PENDING'], (err) => {
                            if (err) console.error(err);
                            pending--;
                            if (pending === 0) {
                                console.log('Dummy tasks added.');
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
