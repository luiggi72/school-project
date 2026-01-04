
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/medical/:student_id
// Get medical record for a student
router.get('/:student_id', (req, res) => {
    res.set('X-Debug-Version', 'V2-ForceRefresh');
    const studentId = req.params.student_id;
    console.log('[Medical API] Fetching for ID: ' + studentId);

    const query =
        'SELECT mr.*, s.birthdate ' +
        'FROM medical_records mr ' +
        'JOIN students s ON mr.student_id = s.id ' +
        'WHERE mr.student_id = ? ';

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('[Medical API] Error in main query:', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            console.log('[Medical API] No medical record found. Fetching birthdate from students table...');
            // If no medical record exists, we still might want the birthdate from students table
            // to pre-fill the form Age.
            const studentQuery = 'SELECT birthdate FROM students WHERE id = ?';
            db.query(studentQuery, [studentId], (err2, studentResults) => {
                if (err2) {
                    console.error('[Medical API] Error in student query:', err2);
                    return res.status(500).json({ error: err2.message });
                }

                console.log('[Medical API] Student query result count: ' + studentResults.length);

                // Return empty medical record structure but with birthdate
                if (studentResults.length > 0) {
                    console.log('[Medical API] Returning birthdate:', studentResults[0].birthdate);
                    return res.json({ birthdate: studentResults[0].birthdate });
                } else {
                    console.log('[Medical API] Student not found in students table either.');
                }
                return res.json(null);
            });
            return; // Stop here
        }
        res.json(results[0]);
    });
});

// POST /api/medical
// Upsert logic (Insert or Update on Duplicate Key)
router.post('/', (req, res) => {
    const {
        student_id,
        blood_type,
        height,
        weight,
        allergies,
        medical_conditions,
        donador_organos, // Retained if previously added, otherwise ignore
        emergency_contact_name,
        emergency_contact_phone,
        doctor_name,
        doctor_phone,
        doctor_email,
        doctor_office,
        insurance_company,
        insurance_policy,
        has_surgeries,
        surgeries_comments,
        has_medications,
        medications, // repurposed as 'detailed list' if has_medications is true
        has_therapy,
        therapy_comments,
        additional_notes
    } = req.body;

    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = `
        INSERT INTO medical_records(
    student_id, blood_type, height, weight, allergies, medical_conditions,
    emergency_contact_name, emergency_contact_phone,
    doctor_name, doctor_phone, doctor_email, doctor_office,
    insurance_company, insurance_policy,
    has_surgeries, surgeries_comments,
    has_medications, medications,
    has_therapy, therapy_comments,
    additional_notes
) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
blood_type = VALUES(blood_type),
    height = VALUES(height),
    weight = VALUES(weight),
    allergies = VALUES(allergies),
    medical_conditions = VALUES(medical_conditions),
    emergency_contact_name = VALUES(emergency_contact_name),
    emergency_contact_phone = VALUES(emergency_contact_phone),
    doctor_name = VALUES(doctor_name),
    doctor_phone = VALUES(doctor_phone),
    doctor_email = VALUES(doctor_email),
    doctor_office = VALUES(doctor_office),
    insurance_company = VALUES(insurance_company),
    insurance_policy = VALUES(insurance_policy),
    has_surgeries = VALUES(has_surgeries),
    surgeries_comments = VALUES(surgeries_comments),
    has_medications = VALUES(has_medications),
    medications = VALUES(medications),
    has_therapy = VALUES(has_therapy),
    therapy_comments = VALUES(therapy_comments),
    additional_notes = VALUES(additional_notes)
        `;

    // Convert booleans/strings to 1/0 for TINYINT if coming from checkboxes/radios
    const toInt = (val) => (val === 'true' || val === true || val === 1 || val === '1') ? 1 : 0;

    const values = [
        student_id, blood_type, height, weight, allergies, medical_conditions,
        emergency_contact_name, emergency_contact_phone,
        doctor_name, doctor_phone, doctor_email, doctor_office,
        insurance_company, insurance_policy,
        toInt(has_surgeries), surgeries_comments,
        toInt(has_medications), medications,
        toInt(has_therapy), therapy_comments,
        additional_notes
    ];

    console.log('[Medical API] Saving. Conditions:', medical_conditions);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving medical record:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Medical record saved successfully', id: result.insertId || result.id });
    });
});

module.exports = router;
