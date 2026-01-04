const db = require('../config/db');

const checkAll = async () => {
    db.query('SELECT u.id, u.username, u.email, (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id) as notif_count FROM users u', (err, results) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.table(results);
        process.exit(0);
    });
};

checkAll();
