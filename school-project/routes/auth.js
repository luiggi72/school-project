const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        console.log('Login attempt:', { email, password });
        if (err) {
            console.error('Login DB Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Login results:', results);
        if (results.length > 0) {
            const user = results[0];

            // Try to find parent details if email matches
            const parentQuery = 'SELECT name, lastnameP, lastnameM FROM student_parents WHERE email = ? LIMIT 1';
            db.query(parentQuery, [email], (pErr, pResults) => {
                if (!pErr && pResults.length > 0) {
                    const parent = pResults[0];
                    user.profile = parent.name; // Only first name as requested
                }
                res.json({ message: 'Login successful', user: user });
            });
        } else {
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

    const query = 'UPDATE users SET password = ? WHERE id = ?';

    db.query(query, [newPassword, userId], (err, result) => {
        if (err) {
            console.error('Change Password DB Error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Contraseña actualizada correctamente' });
    });
});

// Refresh User Data
router.post('/refresh', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Return fresh user data
        res.json({ message: 'Datos actualizados', user: results[0] });
    });
});

module.exports = router;
