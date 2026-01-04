const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('Modifying admin_positions table...');
        await db.promise().query('ALTER TABLE admin_positions MODIFY subarea_id INT NULL');
        console.log('Successfully modified specific column.');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

runMigration();
