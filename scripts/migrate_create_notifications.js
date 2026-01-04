const db = require('../config/db');

const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('INFO', 'WARNING', 'SUCCESS', 'ALERT') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

console.log('Migrating: Creating notifications table...');

db.query(createNotificationsTable, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Table notifications created successfully.');

    // Add dummy notifications for all tutors
    const getTutors = "SELECT id FROM users WHERE role = 'tutor'";
    db.query(getTutors, (err, tutors) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        if (tutors.length === 0) {
            console.log('No tutors found to add dummy notifications.');
            process.exit(0);
        }

        const msgs = [
            { title: 'Bienvenidos al Ciclo 2024-2025', message: 'Estamos muy contentos de iniciar un nuevo año escolar con ustedes.', type: 'INFO' },
            { title: 'Junta de Padres', message: 'Recordatorio: La junta general será el próximo viernes a las 8:00 AM.', type: 'WARNING' },
            { title: 'Pago Recibido', message: 'Hemos recibido su pago de colegiatura de Septiembre correctamente.', type: 'SUCCESS' }
        ];

        let pending = tutors.length * msgs.length;

        tutors.forEach(user => {
            msgs.forEach(msg => {
                const insert = 'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())';
                db.query(insert, [user.id, msg.title, msg.message, msg.type], (err) => {
                    if (err) console.error(err);
                    pending--;
                    if (pending === 0) {
                        console.log('Dummy notifications added.');
                        process.exit(0);
                    }
                });
            });
        });
    });
});
