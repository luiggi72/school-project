const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

async function runFullBackup() {
    console.log('🚀 Starting Full System Backup...');

    // 1. Database Backup
    console.log('\n📦 Step 1: Database Backup');
    try {
        const { stdout, stderr } = await execPromise('node backup_db.js', {
            cwd: path.join(__dirname, '..')
        });
        console.log(stdout);
        if (stderr) console.error('DB Backup Stderr:', stderr);
    } catch (error) {
        console.error('❌ Database backup failed:', error.message);
        return; // Stop if DB backup fails
    }

    // 2. File System Backup
    console.log('\n📂 Step 2: File System Backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-mm-ss
    const zipName = `project_files_${timestamp}.zip`;
    const backupDir = path.join(__dirname, '../backups');
    const zipPath = path.join(backupDir, zipName);

    // Ensure backup dir exists (backup_db.js handles it, but good to be safe)
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    // Zip command
    // Excluding: node_modules, .git, existing backups, and the database file if it's external (though here we dump to JSON)
    const command = `zip -r "${zipPath}" . -x "node_modules/*" -x ".git/*" -x "backups/*" -x "school.db"`;

    try {
        const { stdout, stderr } = await execPromise(command, {
            cwd: path.join(__dirname, '..')
        });
        console.log(stdout.split('\n').slice(-5).join('\n')); // Show last few lines

        const stats = fs.statSync(zipPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log(`\n✅ File backup created: ${zipName}`);
        console.log(`📊 Size: ${sizeMB} MB`);
        console.log(`📍 Location: ${zipPath}`);

    } catch (error) {
        console.error('❌ File backup failed:', error.message);
    }

    console.log('\n✨ Full Backup Process Completed!');
}

runFullBackup();
