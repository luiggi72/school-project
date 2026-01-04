const fs = require('fs');
const path = require('path');
const db = require('./config/db');

// Ensure backups directory exists
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

async function getTables() {
    return new Promise((resolve, reject) => {
        db.query('SHOW TABLES', (err, results) => {
            if (err) return reject(err);
            resolve(results.map(row => Object.values(row)[0]));
        });
    });
}

async function backupDatabase() {
    const backupData = {};
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_school_db_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    console.log(`Starting backup to ${filepath}...`);

    try {
        const tables = await getTables();
        console.log(`Found tables: ${tables.join(', ')}`);

        for (const table of tables) {
            console.log(`Backing up table: ${table}...`);
            const rows = await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM ${table}`, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            backupData[table] = rows;
            console.log(`  -> ${rows.length} records found.`);
        }

        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        console.log(`\nBackup completed successfully! Saved to: backups/${filename}`);
        process.exit(0);

    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
}

backupDatabase();
