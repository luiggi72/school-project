const db = require('../config/db');

const userId = 25; // Luis Fernando
const familyId = 'FAM-7ZBU9'; // Eva Lucia's family_id

const query = 'UPDATE users SET linked_family_id = ? WHERE id = ?';

db.query(query, [familyId, userId], (err, result) => {
    if (err) {
        console.error('Error updating user:', err);
        process.exit(1);
    }
    console.log(`User ${userId} updated. Affected rows: ${result.affectedRows}`);
    process.exit(0);
});
