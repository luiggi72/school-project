const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { verifyPermission } = require('../utils/authMiddleware');
const { PERMISSIONS } = require('../config/permissions');

// Multer Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        // Sanitize filename: remove spaces/special chars, keep extension
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- File Management ---

// POST /upload - Upload a file
// Permission: MANAGE_SCHOOL (same as templates)
router.post('/upload', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// GET /files - List uploaded files
router.get('/files', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), (req, res) => {
    const uploadsDir = path.join(__dirname, '../public/uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error listing uploads:', err);
            return res.status(500).json({ error: 'Failed to list files' });
        }

        // Return files with metadata (size, date) could be better, but names are enough for now
        const fileList = files.filter(f => !f.startsWith('.')); // Ignore hidden files
        res.json(fileList);
    });
});

// DELETE /files/:name - Delete a file
router.delete('/files/:name', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), (req, res) => {
    const filename = req.params.name;
    // Guard against path traversal
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../public/uploads', filename);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted' });
        } catch (e) {
            res.status(500).json({ error: 'Failed to delete file' });
        }
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// --- Rules Management ---

// GET /rules - List all rules
router.get('/rules', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), (req, res) => {
    db.query('SELECT * FROM attachment_rules ORDER BY template_name', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /rules - Create a new rule
router.post('/rules', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), (req, res) => {
    const { template_name, grade_condition, file_name } = req.body;

    if (!template_name || !file_name) {
        return res.status(400).json({ error: 'Template name and file name are required' });
    }

    const query = 'INSERT INTO attachment_rules (template_name, grade_condition, file_name) VALUES (?, ?, ?)';
    db.query(query, [template_name, grade_condition, file_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Rule created', id: result.insertId });
    });
});

// DELETE /rules/:id - Delete a rule
router.delete('/rules/:id', verifyPermission(PERMISSIONS.MANAGE_SCHOOL), (req, res) => {
    db.query('DELETE FROM attachment_rules WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Rule deleted' });
    });
});

module.exports = router;
