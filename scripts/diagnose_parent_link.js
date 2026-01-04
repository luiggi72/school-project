const db = require('../config/db');

const email = 'luis.nachon@hotmail.com';

async function diagnose() {
    try {
        console.log(`Diagnosing for: ${email}`);

        // 1. Get User
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('User NOT FOUND in users table.');
            return;
        }
        const user = users[0];
        console.log('User Record:', user);

        // 2. Get Parent
        const [parents] = await db.promise().query('SELECT * FROM student_parents WHERE email = ?', [email]);
        if (parents.length === 0) {
            console.log('Parent NOT FOUND in student_parents table.');
        } else {
            const parent = parents[0];
            console.log('Parent Record:', parent);

            // 3. Check Linkage
            if (user.linked_family_id !== parent.family_id) {
                console.warn(`MISMATCH: User linked_family_id (${user.linked_family_id}) != Parent family_id (${parent.family_id})`);

                // Fix it?
                console.log('Attempting fix...');
                await db.promise().query('UPDATE users SET linked_family_id = ? WHERE id = ?', [parent.family_id, user.id]);
                console.log('FIX APPLIED: Updated linked_family_id.');
            } else {
                console.log('Linkage appears correct (linked_family_id matches).');
            }

            // 4. Check Students
            const [students] = await db.promise().query('SELECT * FROM students WHERE family_id = ?', [parent.family_id]);
            console.log(`Found ${students.length} students for family_id ${parent.family_id}:`, students.map(s => s.name));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

diagnose();
