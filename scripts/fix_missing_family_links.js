const db = require('../config/db');

async function fixFamilyLinks() {
    console.log('--- Starting Family Link Fix ---');

    // 1. Get all Tutor Users with missing linked_family_id
    const query = `SELECT * FROM users WHERE role = 'tutor' AND (linked_family_id IS NULL OR linked_family_id = '')`;

    db.query(query, async (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            process.exit(1);
        }

        console.log(`Found ${users.length} orphaned tutor users.`);

        for (const user of users) {
            // 2. Find matching parent record by email
            console.log(`Processing User: ${user.email}`);

            // Try to find in student_parents
            const parents = await queryPromise('SELECT * FROM student_parents WHERE email = ?', [user.email]);

            if (parents.length > 0) {
                let familyId = parents[0].family_id;

                // If parent record doesn't have family_id, get it from the student!
                if (!familyId) {
                    console.log(`  > Parent record found but no family_id. checking student ${parents[0].student_id}...`);
                    const students = await queryPromise('SELECT family_id FROM students WHERE id = ?', [parents[0].student_id]);
                    if (students.length > 0) {
                        familyId = students[0].family_id;
                    }
                }

                if (familyId) {
                    console.log(`  > Found Family ID: ${familyId}. Updating user...`);
                    await queryPromise('UPDATE users SET linked_family_id = ? WHERE id = ?', [familyId, user.id]);
                    // Also update parent record for future consistency if it was missing
                    if (!parents[0].family_id) {
                        await queryPromise('UPDATE student_parents SET family_id = ? WHERE email = ?', [familyId, user.email]);
                    }
                } else {
                    console.warn(`  > Could not find family ID for user ${user.email} (Student has no family_id?)`);
                }
            } else {
                console.warn(`  > No student_parents record found for email ${user.email}`);
            }
        }

        console.log('--- Fix Complete ---');
        process.exit(0);
    });
}

function queryPromise(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

fixFamilyLinks();
