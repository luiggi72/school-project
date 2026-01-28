const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

router.post('/', checkAuth, (req, res) => {
    const data = req.body;
    const query = "INSERT INTO eval_6_secu (student_name, application_date, previous_school, current_grade, spanish_indicators, math_indicators, science_indicators, science_observations, english_reception_indicators, english_production_indicators, english_production_observations, cambridge_score, psycho_indicators, sacks_comments, corman_comments, case_studies, general_observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [data.student_name, data.application_date, data.previous_school, data.current_grade, JSON.stringify(data.spanish_indicators), JSON.stringify(data.math_indicators), JSON.stringify(data.science_indicators), data.science_observations, JSON.stringify(data.english_reception_indicators), JSON.stringify(data.english_production_indicators), data.english_production_observations, data.cambridge_score, JSON.stringify(data.psycho_indicators), data.sacks_comments, data.corman_comments, data.case_studies, data.general_observations];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving:', err);
            return res.status(500).json({ error: 'Error al guardar' });
        }
        res.status(201).json({ message: 'Guardado', id: result.insertId });
    });
});
module.exports = router;