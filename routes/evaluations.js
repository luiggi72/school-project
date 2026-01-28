const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

// POST /api/evaluations - Save a new evaluation
router.post('/', checkAuth, (req, res) => {
    const {
        student_name,
        application_date,
        current_grade,
        previous_school,
        spanish_indicators,
        math_indicators,
        science_indicators,
        academic_observations,
        english_indicators,
        english_percentage_reception,
        english_percentage_production,
        english_observations,
        psycho_indicators,
        human_figure_level,
        emotional_indicators,
        bender_level,
        psycho_observations
    } = req.body;

    const query = `
        INSERT INTO evaluations_2_to_3 (
            student_name, application_date, current_grade, previous_school,
            spanish_indicators, math_indicators, science_indicators, academic_observations,
            english_indicators, english_percentage_reception, english_percentage_production, english_observations,
            psycho_indicators, human_figure_level, emotional_indicators, bender_level, psycho_observations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        student_name,
        application_date,
        current_grade,
        previous_school,
        JSON.stringify(spanish_indicators),
        JSON.stringify(math_indicators),
        JSON.stringify(science_indicators),
        academic_observations,
        JSON.stringify(english_indicators),
        english_percentage_reception,
        english_percentage_production,
        english_observations,
        JSON.stringify(psycho_indicators),
        human_figure_level,
        emotional_indicators,
        bender_level,
        psycho_observations
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving evaluation:', err);
            return res.status(500).json({ error: 'Error al guardar la evaluación' });
        }
        res.status(201).json({ message: 'Evaluación guardada correctamente', id: result.insertId });
    });
});

module.exports = router;
