const db = require('./config/db');

db.query("UPDATE users SET email = 'admin@example.com' WHERE username = 'admin'", (err, result) => {
    if (err) {
        console.error('Error updating admin email:', err);
    } else {
        console.log('Admin email updated to admin@example.com');
    }
    process.exit();
});
