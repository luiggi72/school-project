const db = require('../config/db');

const userId = 33;

async function createNotification() {
    try {
        console.log(`Creating test notification for user ${userId}...`);

        await db.promise().query(
            'INSERT INTO user_notifications (user_id, title, message, category, is_read, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [userId, 'Prueba de Sistema', 'Esta es una notificación de prueba para verificar el sistema.', 'PERSONAL', 0]
        );

        console.log('Notification created successfully.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

createNotification();
