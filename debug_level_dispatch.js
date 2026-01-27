require('dotenv').config();
const db = require('./config/db');

const LEVEL_ID = '3'; // String '3' as passed from frontend

function testSubquery() {
    console.log(`Testing Level ID: '${LEVEL_ID}' with subquery...`);

    // Exact query from notificationService.js
    const query = `
         SELECT DISTINCT u.push_token, u.id as user_id,
         (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id AND un.is_read = 0) as unread_count
         FROM users u 
         JOIN students s ON u.linked_family_id = s.family_id 
         WHERE s.grade = (SELECT name FROM academic_levels WHERE id = ?)
     `;

    db.query(query, [LEVEL_ID], (err, results) => {
        if (err) {
            console.error('Query Error:', err);
            process.exit(1);
        }
        console.log(`Results found: ${results.length}`);
        if (results.length > 0) {
            console.log('Sample Result:', results[0]);
        } else {
            console.log('No results.');

            // Check if subquery works alone
            db.query("SELECT name FROM academic_levels WHERE id = ?", [LEVEL_ID], (err, levels) => {
                console.log('Subquery check - Levels found:', levels);
            });
        }

        // Use timeout to allow logical connection closure if needed, though process.exit forces it
        setTimeout(() => process.exit(), 1000);
    });
}

testSubquery();
