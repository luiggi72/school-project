const db = require('./config/db');

const targetId = 'S176532601193630'; // ID from previous log

const query = `
    SELECT id, name, lastnameP, lastnameM, family_id, grade 
    FROM students 
    WHERE family_id = (SELECT family_id FROM students WHERE id = ?)
`;

db.query(query, [targetId], (err, results) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Siblings Found:');
        console.table(results);
    }
    process.exit();
});
