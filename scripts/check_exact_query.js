const db = require('../config/db');

const userId = "33";

async function checkNotifications() {
    try {
        console.log(`Checking matching query for userId: "${userId}"`);

        const query = 'SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
        const [notifs] = await db.promise().query(query, [userId]);

        console.log(`Query: ${query}`);
        console.log(`Results: ${notifs.length}`);
        if (notifs.length > 0) console.log(notifs[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkNotifications();
