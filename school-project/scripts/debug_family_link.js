const db = require('../config/db');

console.log('--- USERS (Tutors) ---');
db.query("SELECT id, username, email, role, linked_family_id FROM users WHERE role='tutor' LIMIT 5", (err, tutors) => {
    if (err) { console.error(err); process.exit(1); }
    console.table(tutors);

    console.log('\n--- STUDENTS ---');
    db.query("SELECT id, name, lastnameP, family_id FROM students LIMIT 10", (err, students) => {
        if (err) { console.error(err); process.exit(1); }
        console.table(students);
        process.exit(0);
    });
});
