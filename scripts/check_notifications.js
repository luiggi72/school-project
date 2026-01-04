const db = require('../config/db');

// Use the user ID we found previously (33)
const userId = 33;

async function checkNotifications() {
    try {
        console.log(`Checking notifications for userId: ${userId}`);

        // 1. Check user_notifications
        const [notifs] = await db.promise().query('SELECT * FROM user_notifications WHERE user_id = ?', [userId]);

        if (notifs.length === 0) {
            console.log('NO NOTIFICATIONS found for this user.');
        } else {
            console.log(`Found ${notifs.length} notifications:`);
            notifs.forEach(n => {
                console.log(`- [${n.is_read ? 'READ' : 'UNREAD'}] ${n.title}: ${n.message} (Category: ${n.category})`);
            });
        }

        // 2. Check notifications table (source) just to be sure
        const [allNotifs] = await db.promise().query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
        console.log('\nUser Notifications (Source table sample):');
        console.log(allNotifs);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkNotifications();
