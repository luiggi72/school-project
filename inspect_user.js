const db = require('./config/db');

const email = 'luis.nachon@hotmail.com'; // Or 'lnh72@hotmail.com' depending on which one was logged in

async function checkUser() {
    console.log('Checking user:', email);
    try {
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('User Record:', users);
        
        if (users.length > 0) {
            const user = users[0];
            console.log('User ID:', user.id);
            console.log('Linked Family ID:', user.linked_family_id);

            // Also check student_parents to see what family_id they have
            const [parents] = await db.promise().query('SELECT * FROM student_parents WHERE email = ?', [email]);
            console.log('Parent Record:', parents);
        } else {
             // Check the other email just in case
             console.log('User not found with', email, 'trying lnh72@hotmail.com');
             const [users2] = await db.promise().query('SELECT * FROM users WHERE email = ?', ['lnh72@hotmail.com']);
             console.log('User Record (lnh72):', users2);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
