const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

router.post('/', checkAuth, (req, res) => {
    const data = req.body;
    const query = "INSERT INTO eval_4_5 (student_name, application_date, previous_school, current_grade, spanish_indicators, spanish_observations, math_indicators, math_observations, english_reception_indicators, english_production_indicators, english_production_observations, english_percent_reception, english_percent_production, psycho_indicators, psycho_observations, nivel_desarrollo, indicadores_emocionales, nivel_bender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [data.student_name, data.application_date, data.previous_school, data.current_grade, JSON.stringify(data.spanish_indicators), data.spanish_observations, JSON.stringify(data.math_indicators), data.math_observations, JSON.stringify(data.english_reception_indicators), JSON.stringify(data.english_production_indicators), data.english_production_observations, data.english_percent_reception, data.english_percent_production, JSON.stringify(data.psycho_indicators), data.psycho_observations, data.nivel_desarrollo, data.indicadores_emocionales, data.nivel_bender];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving:', err);
            return res.status(500).json({ error: 'Error al guardar' });
        }
        res.status(201).json({ message: 'Guardado', id: result.insertId });
    });
});
module.exports = router;