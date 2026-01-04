const db = require('../config/db');

const checkUsersSchema = () => {
    const query = 'DESCRIBE users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error describing users table:', err);
            process.exit(1);
        }
        console.log('Users Table Schema:');
        console.table(results);

        const hasLinkedFamilyId = results.some(r => r.Field === 'linked_family_id');
        console.log(`Has 'linked_family_id': ${hasLinkedFamilyId}`);
        process.exit(0);
    });
};

checkUsersSchema();
