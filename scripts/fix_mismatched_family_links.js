const db = require('../config/db');

async function fixMismatchedLinks() {
    console.log('--- Starting Family Link Mismatch Fix ---');

    // 1. Get ALL Tutor Users
    const query = `SELECT * FROM users WHERE role = 'tutor'`;

    db.query(query, async (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            process.exit(1);
        }

        console.log(`Scanning ${users.length} tutor users for mismatches...`);

        for (const user of users) {
            // 2. Find matching parent record by email
            const parents = await queryPromise('SELECT * FROM student_parents WHERE email = ?', [user.email]);

            if (parents.length > 0) {
                // We prioritize the student's family_id as the source of truth
                // because users might have been created with random/wrong IDs initially.
                let realFamilyId = null;

                // Check student
                const students = await queryPromise('SELECT family_id FROM students WHERE id = ?', [parents[0].student_id]);
                if (students.length > 0) {
                    realFamilyId = students[0].family_id;
                }

                if (realFamilyId) {
                    if (user.linked_family_id !== realFamilyId) {
                        console.log(`[MISMATCH FIXED] User ${user.email}:`);
                        console.log(`   Current Stored ID: ${user.linked_family_id}`);
                        console.log(`   Actual Student ID: ${realFamilyId}`);

                        await queryPromise('UPDATE users SET linked_family_id = ? WHERE id = ?', [realFamilyId, user.id]);
                        await queryPromise('UPDATE student_parents SET family_id = ? WHERE email = ?', [realFamilyId, user.email]);
                        console.log('   > Updated user and parent record successfully.');
                    }
                } else {
                    console.warn(`[WARNING] User ${user.email} links to student ${parents[0].student_id} which has NO family_id!`);
                }
            }
        }

        console.log('--- Scan Complete ---');
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

fixMismatchedLinks();
