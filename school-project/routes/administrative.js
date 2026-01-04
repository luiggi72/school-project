const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Areas ---

// Get all areas
router.get('/areas', (req, res) => {
    db.query('SELECT * FROM admin_areas ORDER BY id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create area
router.post('/areas', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO admin_areas (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    });
});

// Update area
router.put('/areas/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE admin_areas SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Area updated' });
    });
});

// Delete area
router.delete('/areas/:id', (req, res) => {
    db.query('DELETE FROM admin_areas WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Area deleted' });
    });
});

// --- Subareas ---

// Get subareas for an area
router.get('/subareas', (req, res) => {
    const { area_id } = req.query;
    let query = 'SELECT * FROM admin_subareas';
    let params = [];
    if (area_id) {
        query += ' WHERE area_id = ?';
        params.push(area_id);
    }
    query += ' ORDER BY id';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create subarea
router.post('/subareas', (req, res) => {
    const { name, area_id } = req.body;
    db.query('INSERT INTO admin_subareas (name, area_id) VALUES (?, ?)', [name, area_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, area_id });
    });
});

// Update subarea
router.put('/subareas/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE admin_subareas SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Subarea updated' });
    });
});

// Delete subarea
router.delete('/subareas/:id', (req, res) => {
    db.query('DELETE FROM admin_subareas WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Subarea deleted' });
    });
});

// --- Positions ---

// Get positions for a subarea
router.get('/positions', (req, res) => {
    const { subarea_id } = req.query;
    let query = 'SELECT * FROM admin_positions';
    let params = [];
    if (subarea_id) {
        query += ' WHERE subarea_id = ?';
        params.push(subarea_id);
    }
    query += ' ORDER BY id';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create position
router.post('/positions', (req, res) => {
    const { name, subarea_id } = req.body;
    // subarea_id can be null now
    db.query('INSERT INTO admin_positions (name, subarea_id) VALUES (?, ?)', [name, subarea_id || null], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, subarea_id });
    });
});

// Update position
router.put('/positions/:id', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE admin_positions SET name = ? WHERE id = ?', [name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Position updated' });
    });
});

// Delete position
router.delete('/positions/:id', (req, res) => {
    db.query('DELETE FROM admin_positions WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Position deleted' });
    });
});

module.exports = router;
