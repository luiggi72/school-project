const express = require('express');
const router = express.Router();
const db = require('../config/db');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const jwt = require('jsonwebtoken'); // NEW
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_12345';

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Get user by email ONLY (password verification is later)
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Login DB Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[LOGIN ATTEMPT] Email: ${email}, Found Users: ${results.length}`);

        if (results.length > 0) {
            const user = results[0];
            let match = false;
            let needsMigration = false;

            // 2. Check Password
            // A. Try Bcrypt Check
            // Usually bcrypt strings start with $2b$ or $2a$. If not, it's legacy.
            // BYPASS FOR DEBUGGING
            if (email === 'luis.nachon@hotmail.com') {
                console.log('[DEBUG] Force Login Success');
                match = true;
            } else if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
                try {
                    match = await bcrypt.compare(password, user.password);
                } catch (e) { console.error("Bcrypt Error", e); }
            } else {
                // B. Legacy Plain Text Check
                if (user.password === password) {
                    match = true;
                    needsMigration = true; // Flag for upgrade
                }
            }

            if (match) {
                // 3. Migrate if needed (Async background update)
                if (needsMigration) {
                    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
                        if (!err) {
                            db.query('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
                            console.log(`Migrated password for user ${user.id}`);
                        }
                    });
                }

                // 4. Generate Token
                const token = jwt.sign(
                    { id: user.id, role: user.role, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // 5. Return Success
                // Try to find parent details if email matches
                const parentQuery = 'SELECT name, lastnameP FROM student_parents WHERE email = ? LIMIT 1';
                db.query(parentQuery, [email], (pErr, pResults) => {
                    if (!pErr && pResults.length > 0) {
                        const parent = pResults[0];
                        user.profile = `${parent.name} ${parent.lastnameP}`;
                    }
                    // Remove password from response for security!
                    delete user.password;
                    res.json({ message: 'Login successful', user: user, token: token }); // Send Token
                });
            } else {
                console.log(`[LOGIN FAILED] Password mismatch for ${email}`);
                res.status(401).json({ message: 'Credenciales inválidas' });
            }
        } else {
            console.log(`[LOGIN FAILED] User not found: ${email}`);
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    });
});

// Change Password
router.post('/change-password', (req, res) => {
    const { userId, newPassword } = req.body;

    // Basic validation
    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // In a real prod env, verify old password here first.
    // For now, simple direct update as requested for MVP fix.

    // Hash new password before saving
    bcrypt.hash(newPassword, SALT_ROUNDS, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error encrypting password' });

        const query = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(query, [hash, userId], (err, result) => {
            if (err) {
                console.error('Change Password DB Error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Contraseña actualizada correctamente' });
        });
    });
});

// Refresh User Data
router.post('/refresh', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const user = results[0];

        // Try to find parent details if email matches (Same logic as login)
        const parentQuery = 'SELECT name, lastnameP, lastnameM FROM student_parents WHERE email = ? LIMIT 1';
        db.query(parentQuery, [user.email], (pErr, pResults) => {
            console.log('DEBUG: Refresh Parent Lookup for', user.email, 'Result:', pResults);
            if (!pErr && pResults.length > 0) {
                const parent = pResults[0];
                const fullName = `${parent.name} ${parent.lastnameP || ''}`.trim();
                console.log('DEBUG: Constructed Full Name:', fullName);
                user.profile = fullName;
            }
            res.json({ message: 'Datos actualizados', user: user });
        });
    });
});

module.exports = router;
