const db = require('./config/db');

const checkLastParams = async () => {
    // Select the last inserted student based on the timestamp-like ID or just order by DB insertion order if we had an auto-inc
    // Since ID is 'S' + timestamp, we can order by ID descending to get the latest one provided they are created sequentially enough

    // Using a simple query to get the one with unique_id = 'TEST12345'
    const query = "SELECT id, name, family_id FROM students WHERE unique_id = 'TEST123456'";

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
        } else {
            console.log('Student record:', results[0]);
        }
        process.exit();
    });
};

checkLastParams();
