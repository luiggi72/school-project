const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all concepts
router.get('/', (req, res) => {
    const query = 'SELECT * FROM payment_concepts ORDER BY name';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new concept
router.post('/', (req, res) => {
    const { name, default_amount, academic_level } = req.body;
    const query = 'INSERT INTO payment_concepts (name, default_amount, academic_level) VALUES (?, ?, ?)';

    // Default to 'GENERAL' if not provided
    const level = academic_level || 'GENERAL';

    db.query(query, [name, default_amount, level], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Concept created', id: result.insertId });
    });
});

// Update a concept
router.put('/:id', (req, res) => {
    const { name, default_amount, academic_level } = req.body;
    const { id } = req.params;
    const query = 'UPDATE payment_concepts SET name = ?, default_amount = ?, academic_level = ? WHERE id = ?';

    const level = academic_level || 'GENERAL';

    db.query(query, [name, default_amount, level, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Concept updated' });
    });
});

// Delete a concept
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM payment_concepts WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Concept deleted' });
    });
});

module.exports = router;
