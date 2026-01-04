const fetch = require('node-fetch');

// Mock data
const payload = {
    student_id: 1, // specific ID doesn't matter much if item has one, assuming mock DB or existing ID
    payment_method: 'Efectivo',
    payment_date: '2025-12-09',
    items: [
        { student_id: 1, concept: 'Test Concept 1', amount: 100 },
        { student_id: 1, concept: 'Test Concept 2', amount: 200 }
    ]
};

// Need session or bypass auth?
// The project uses `verifyPermission`.
// I cannot easily Bypass auth from external script unless I login first.
// But I can run a script that imports 'app' (if exported) or just simulates DB query.
// Actually, I can use the existing 'server.js' session if I had cookies, but I don't.
// I'll try to invoke the DB logic directly to verify SQL syntax.
// Wait, I can just use `db.query` directly in a script to test the INSERT logic.

const db = require('./config/db');

const items = payload.items;
const student_id = payload.student_id;
const payment_method = payload.payment_method;
const payment_date = payload.payment_date;

console.log('Testing SQL Query Construction...');

const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date) VALUES ?';
const values = items.map(item => [item.student_id || student_id, item.concept, item.amount, payment_method, payment_date]);

console.log('Values:', values);

db.query(query, [values], (err, result) => {
    if (err) {
        console.error('SQL Error:', err);
    } else {
        console.log('Success! Insert ID:', result.insertId, 'Affected:', result.affectedRows);
    }
    process.exit();
});
