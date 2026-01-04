const db = require('./config/db');

const cleanup = async () => {
    const query = "DELETE FROM students WHERE unique_id IN ('TEST12345', 'TEST123456')";
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error deleting test students:', err);
        } else {
            console.log(`Deleted ${result.affectedRows} test students.`);
        }
        process.exit();
    });
};

cleanup();
