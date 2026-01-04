const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get notifications for a user
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
    const notificationId = req.params.id;
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';

    db.query(query, [notificationId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Marked as read' });
    });
});

module.exports = router;
