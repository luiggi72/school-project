const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { savePushToken, dispatchNotification } = require('../services/notificationService');

// Admin sends notification (POST /request is for specific CoDi flow, but generic is separate)
// We'll stick to the current implementation
router.post('/send', async (req, res) => {
    // ... code ...
});

// Duplicate /my-notifications route removed

// Register Push Token
router.post('/register-token', async (req, res) => {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: 'Missing userId or token' });

    try {
        await savePushToken(userId, token);
        res.json({ success: true, message: 'Token saved' });
    } catch (error) {
        console.error('Token Reg Error:', error);
        res.status(500).json({ error: 'Failed to save token' });
    }
});

// Dispatch Notification (Admin only ideally)
router.post('/dispatch', async (req, res) => {
    // Body: { title, message, target: { type, value }, data }
    const { title, message, target, data } = req.body;
    console.log('DEBUG: Dispatch Request:', { title, message, target });

    if (!title || !message || !target) {
        return res.status(400).json({ error: 'Missing title, message, or target' });
    }

    try {
        const result = await dispatchNotification(target, title, message, data);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Dispatch Error:', error);
        res.status(500).json({ error: 'Failed to dispatch', details: error.message });
    }
});

// GET /my-notifications
// Note: In a real app with auth middleware, we'd use req.user.id
// For now, we accept userId as a query param for simplicity in the prototypes
router.get('/my-notifications', (req, res) => {
    const userId = req.query.userId;
    console.error('DEBUG: GET /my-notifications Hit. Query userId:', userId);

    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing userId' });

    const query = 'SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.error(`DEBUG: Found ${results.length} notifications for user ${userId}`);
        res.json(results);
    });
});

// PUT /:id/read
router.put('/:id/read', (req, res) => {
    const notifId = req.params.id;
    const query = 'UPDATE user_notifications SET is_read = 1 WHERE id = ?';
    db.query(query, [notifId], (err, result) => {
        if (err) {
            console.error('Error marking read:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
