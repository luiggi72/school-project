const axios = require('axios');
const db = require('../config/db');

const check = async () => {
    // 1. Get a user ID from DB (any user that might have notifications)
    // For now, let's grab the first user
    db.query('SELECT id, username FROM users LIMIT 1', async (err, users) => {
        if (err || !users.length) {
            console.error('No users found');
            process.exit(1);
        }

        const user = users[0];
        console.log(`Checking notifications for user: ${user.username} (ID: ${user.id})`);

        try {
            const response = await axios.get(`http://localhost:3000/api/notifications/my-notifications?userId=${user.id}`);
            console.log('API Response:', response.data);

            // Also check DB directly
            db.query('SELECT * FROM user_notifications WHERE user_id = ?', [user.id], (err, dbNotifs) => {
                console.log('DB Content:', dbNotifs);
                process.exit(0);
            });

        } catch (error) {
            console.error('API Error:', error.message);
            process.exit(1);
        }
    });
};

check();
