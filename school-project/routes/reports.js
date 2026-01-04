const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/reports/income
// Query Params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
router.get('/income', (req, res) => {
    const { startDate, endDate } = req.query;

    let query = `
        SELECT 
            p.id,
            p.payment_date,
            p.concept,
            p.amount,
            p.payment_method,
            CONCAT(s.name, ' ', s.lastnameP, ' ', s.lastnameM) AS student_name
        FROM payments p
        JOIN students s ON p.student_id = s.id
    `;

    const queryParams = [];
    const conditions = [];

    if (startDate) {
        conditions.push('p.payment_date >= ?');
        queryParams.push(startDate);
    }

    if (endDate) {
        conditions.push('p.payment_date <= ?');
        queryParams.push(endDate);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.payment_date DESC';

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
