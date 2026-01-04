const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Levels ---

// Get all levels
router.get('/levels', (req, res) => {
    db.query('SELECT * FROM academic_levels ORDER BY id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create level
router.post('/levels', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO academic_levels (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    });
});

// Update level
router.put('/levels/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE academic_levels SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Level updated' });
    });
});

// Delete level
router.delete('/levels/:id', (req, res) => {
    db.query('DELETE FROM academic_levels WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Level deleted' });
    });
});

// --- Grades ---

// Get grades for a level
router.get('/grades', (req, res) => {
    const { level_id } = req.query;
    let query = 'SELECT * FROM academic_grades';
    let params = [];
    if (level_id) {
        query += ' WHERE level_id = ?';
        params.push(level_id);
    }
    query += ' ORDER BY id';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create grade
router.post('/grades', (req, res) => {
    const { name, level_id } = req.body;
    db.query('INSERT INTO academic_grades (name, level_id) VALUES (?, ?)', [name, level_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, level_id });
    });
});

// Update grade
router.put('/grades/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE academic_grades SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Grade updated' });
    });
});

// Delete grade
router.delete('/grades/:id', (req, res) => {
    db.query('DELETE FROM academic_grades WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Grade deleted' });
    });
});

// --- Groups ---

// Get groups for a grade
router.get('/groups', (req, res) => {
    const { grade_id } = req.query;
    let query = 'SELECT * FROM academic_groups';
    let params = [];
    if (grade_id) {
        query += ' WHERE grade_id = ?';
        params.push(grade_id);
    }
    query += ' ORDER BY id';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create group
router.post('/groups', (req, res) => {
    const { name, grade_id } = req.body;
    db.query('INSERT INTO academic_groups (name, grade_id) VALUES (?, ?)', [name, grade_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, grade_id });
    });
});

// Update group
router.put('/groups/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE academic_groups SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Group updated' });
    });
});

// Delete group
router.delete('/groups/:id', (req, res) => {
    db.query('DELETE FROM academic_groups WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Group deleted' });
    });
});

module.exports = router;
