const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get school info
router.get('/', (req, res) => {
    db.query('SELECT * FROM school_info WHERE id = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

// Update school info
router.post('/', (req, res) => {
    const {
        commercial_name,
        street,
        exterior_number,
        neighborhood,
        zip_code,
        city,
        state,
        phones
    } = req.body;

    // Convert phones array to JSON string if it's an array
    const phonesStr = Array.isArray(phones) ? JSON.stringify(phones) : phones;

    const query = `
        INSERT INTO school_info 
        (id, commercial_name, street, exterior_number, neighborhood, zip_code, city, state, phone) 
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        commercial_name=?, street=?, exterior_number=?, neighborhood=?, zip_code=?, city=?, state=?, phone=?
    `;

    const params = [
        commercial_name, street, exterior_number, neighborhood, zip_code, city, state, phonesStr,
        commercial_name, street, exterior_number, neighborhood, zip_code, city, state, phonesStr
    ];

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'School info updated' });
    });
});

module.exports = router;
