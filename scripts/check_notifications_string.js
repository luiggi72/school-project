const db = require('../config/db');

// Test with STRING userId
const userId = "33";

async function checkNotifications() {
    try {
        console.log(`Checking notifications for userId: "${userId}" (String)`);

        const [notifs] = await db.promise().query('SELECT * FROM user_notifications WHERE user_id = ?', [userId]);

        if (notifs.length === 0) {
            console.log('NO NOTIFICATIONS found via String ID.');
        } else {
            console.log(`Found ${notifs.length} notifications via String ID.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkNotifications();
