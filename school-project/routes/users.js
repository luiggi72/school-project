const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyPermission } = require('../utils/authMiddleware');
const { PERMISSIONS } = require('../config/permissions');

// Get all users (Admin only)
router.get('/', verifyPermission(PERMISSIONS.MANAGE_USERS), (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add user
router.post('/', verifyPermission(PERMISSIONS.MANAGE_USERS), (req, res) => {
    const { username, email, password, role, profile, linked_family_id } = req.body;
    // Note: Password should be hashed in a real app
    const query = 'INSERT INTO users (username, email, password, role, profile, linked_family_id) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [username, email, password || '123456', role, profile, linked_family_id || null], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User added', id: result.insertId });
    });
});

// Update user
router.put('/:id', verifyPermission(PERMISSIONS.MANAGE_USERS), (req, res) => {
    const { username, email, role, profile, linked_family_id } = req.body;

    console.log('UPDATE USER REQUEST:', { id: req.params.id, body: req.body });

    const query = 'UPDATE users SET username=?, email=?, role=?, profile=?, linked_family_id=? WHERE id=?';
    const params = [username, email, role, profile, linked_family_id || null, req.params.id];

    console.log('Executing Query Params:', params);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Update Error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User updated' });
    });
});

// Delete user
router.delete('/:id', verifyPermission(PERMISSIONS.MANAGE_USERS), (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

module.exports = router;
