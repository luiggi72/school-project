const db = require('../config/db');

const clearNotifications = () => {
    const query = 'DELETE FROM user_notifications';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error clearing notifications:', err);
            process.exit(1);
        } else {
            console.log(`✅ Successfully deleted ${result.affectedRows} notifications.`);
            process.exit(0);
        }
    });
};

clearNotifications();
