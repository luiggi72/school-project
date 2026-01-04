const db = require('./config/db');

const query = `
    SELECT p.id, p.student_id, s.name, s.lastnameP, p.concept, p.amount, p.created_at
    FROM payments p
    LEFT JOIN students s ON p.student_id = s.id
    ORDER BY p.id DESC
    LIMIT 10
`;

db.query(query, (err, results) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Last 10 Payments:');
        console.table(results);
    }
    process.exit();
});
