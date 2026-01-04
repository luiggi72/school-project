const db = require('../config/db');

async function checkUserFamilyLinks() {
    console.log('--- Checking User Family Links ---');
    try {
        const users = await new Promise((resolve, reject) => {
            db.query("SELECT id, username, role, linked_family_id FROM users WHERE role NOT IN ('admin', 'director')", (err, res) => {
                if (err) reject(err); else resolve(res);
            });
        });

        console.log(`Found ${users.length} non-admin users.`);

        for (const user of users) {
            console.log(`\nUser: ${user.username} (Role: ${user.role})`);
            console.log(`  Linked Family ID: ${user.linked_family_id}`);

            if (user.linked_family_id) {
                const students = await new Promise((resolve, reject) => {
                    db.query("SELECT * FROM students WHERE family_id = ?", [user.linked_family_id], (err, res) => {
                        if (err) reject(err); else resolve(res);
                    });
                });
                console.log(`  -> Found ${students.length} students linked.`);
                students.forEach(s => console.log(`     - ${s.name} ${s.lastnameP}`));
            } else {
                console.log('  -> No family ID linked.');
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

checkUserFamilyLinks();
