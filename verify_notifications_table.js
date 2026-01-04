const db = require('./config/db');

const verifyTable = () => {
    const query = 'DESCRIBE user_notifications';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error describing user_notifications:', err);
            process.exit(1);
        } else {
            console.log('✅ user_notifications table exists.');
            console.log('Columns:');
            results.forEach(col => console.log(` - ${col.Field} (${col.Type})`));
            process.exit(0);
        }
    });
};

verifyTable();
