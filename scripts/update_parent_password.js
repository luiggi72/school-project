const db = require('../config/db');

const email = 'luis.nachon@hotmail.com';
const password = '12345';
const role = 'tutor';
const username = 'Luis Nachón'; // Placeholder, will try to fetch from parents if possible, or use this

async function run() {
    try {
        // 1. Check if user exists
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log(`User ${email} found. Updating password...`);
            await db.promise().query('UPDATE users SET password = ? WHERE email = ?', [password, email]);
            console.log('Password updated successfully.');
        } else {
            console.log(`User ${email} not found. Creating new user...`);

            // Optional: Try to find name in student_parents to be nicer
            const [parents] = await db.promise().query('SELECT * FROM student_parents WHERE email = ?', [email]);
            let finalUsername = username;

            if (parents.length > 0) {
                finalUsername = `${parents[0].name} ${parents[0].lastnameP}`;
                console.log(`Found parent record: ${finalUsername}`);
            } else {
                console.log('No parent record found, using default username.');
            }

            await db.promise().query(
                'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
                [finalUsername, email, password, role]
            );
            console.log('User created successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

run();
