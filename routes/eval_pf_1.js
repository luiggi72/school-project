const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

router.post('/', checkAuth, (req, res) => {
    const data = req.body;
    const query = "INSERT INTO eval_pf_1 (student_name, application_date, previous_school, current_grade, spanish_indicators, spanish_observations, english_indicators, english_observations, psycho_indicators, psycho_observations, nivel_desarrollo, nivel_madurez, pronostico, emocionales) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [data.student_name, data.application_date, data.previous_school, data.current_grade, JSON.stringify(data.spanish_indicators), data.spanish_observations, JSON.stringify(data.english_indicators), data.english_observations, JSON.stringify(data.psycho_indicators), data.psycho_observations, data.nivel_desarrollo, data.nivel_madurez, data.pronostico, data.emocionales];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving:', err);
            return res.status(500).json({ error: 'Error al guardar' });
        }
        res.status(201).json({ message: 'Guardado', id: result.insertId });
    });
});
module.exports = router;