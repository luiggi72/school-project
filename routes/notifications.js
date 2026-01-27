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

// Configure multer for attachment uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads/notifications');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'notif-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Dispatch Notification (Admin only ideally)
router.post('/dispatch', upload.single('attachment'), async (req, res) => {
    // Body: { title, message, target: { type, value }, data }
    // Note: When using multer, req.body is populated after multer processes the file
    // Also, target might come as a JSON string if sent via FormData, so we need to parse it if string

    let { title, message, target, data } = req.body;

    // Parse target if it's a string (FormData sends objects as strings)
    if (typeof target === 'string') {
        try {
            target = JSON.parse(target);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid target format' });
        }
    }

    // Parse data if it's a string
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data || '{}');
        } catch (e) {
            data = {};
        }
    }

    const attachmentUrl = req.file ? `/uploads/notifications/${req.file.filename}` : null;

    console.log('DEBUG: Dispatch Request:', { title, message, target, attachment: attachmentUrl });

    if (!title || !message || !target) {
        return res.status(400).json({ error: 'Missing title, message, or target' });
    }

    try {
        // Pass attachmentUrl to dispatchNotification service
        // We'll need to update dispatchNotification signature or pass in data/context
        const result = await dispatchNotification(target, title, message, data, attachmentUrl);
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

// --- Batch Management Routes (New) ---

// GET /sent - List sent notification batches (grouped)
router.get('/sent', (req, res) => {
    // Group by batch_id, but we need to handle legacy notifications (batch_id IS NULL)
    // For legacy, we might not show them or show as 'Legacy'.
    // Here we focus on batch_id IS NOT NULL for the managed history.
    const query = `
        SELECT 
            batch_id, 
            MAX(title) as title, 
            MAX(message) as message, 
            MAX(category) as category, 
            MAX(created_at) as created_at, 
            COUNT(*) as recipient_count, 
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count 
        FROM user_notifications 
        WHERE batch_id IS NOT NULL 
        GROUP BY batch_id 
        ORDER BY created_at DESC
        LIMIT 50
    `;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error('Error fetching sent batches:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// PUT /batch/:batchId - Edit a sent batch (title/message)
router.put('/batch/:batchId', (req, res) => {
    const { batchId } = req.params;
    const { title, message } = req.body;

    if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });

    const query = 'UPDATE user_notifications SET title = ?, message = ? WHERE batch_id = ?';
    db.query(query, [title, message, batchId], (err, result) => {
        if (err) {
            console.error('Error updating batch:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

// DELETE /batch/:batchId - Delete a sent batch (revoke)
router.delete('/batch/:batchId', (req, res) => {
    const { batchId } = req.params;

    const query = 'DELETE FROM user_notifications WHERE batch_id = ?';
    db.query(query, [batchId], (err, result) => {
        if (err) {
            console.error('Error deleting batch:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, deletedRows: result.affectedRows });
    });
});

module.exports = router;
