const db = require('./config/db');
const bcrypt = require('bcrypt');

const email = 'luis.nachon@hotmail.com';
const newPassword = '123456';
const SALT_ROUNDS = 10;

async function resetPassword() {
    console.log(`Resetting password for ${email} to ${newPassword}`);

    try {
        const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.promise().query('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
        console.log('Password updated successfully.');
        process.exit();
    } catch (err) {
        console.error('Error resetting password:', err);
        process.exit(1);
    }
}

resetPassword();
