const db = require('../config/db');

console.log('--- Migrating: Adding family_id to student_parents ---');

// 1. Add Column if not exists
const addColumnQuery = "ALTER TABLE student_parents ADD COLUMN family_id VARCHAR(20) DEFAULT NULL";

db.query(addColumnQuery, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column family_id already exists.');
        } else {
            console.error('Error adding column:', err);
            process.exit(1);
        }
    } else {
        console.log('Column family_id added.');
    }

    // 2. Backfill Data
    const updateQuery = `
        UPDATE student_parents sp
        JOIN students s ON sp.student_id = s.id
        SET sp.family_id = s.family_id
        WHERE sp.family_id IS NULL;
    `;

    db.query(updateQuery, (err, result) => {
        if (err) {
            console.error('Error backfilling data:', err);
        } else {
            console.log(`Backfilled family_id for ${result.changedRows} parents.`);
        }
        process.exit();
    });
});
