const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

// GET /api/inquiries/schools (Autocomplete suggestions)
router.get('/schools', checkAuth, (req, res) => {
    const query = `
        SELECT DISTINCT previous_school 
        FROM inquiries 
        WHERE previous_school IS NOT NULL AND previous_school != '' 
        ORDER BY previous_school ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(r => r.previous_school));
    });
});

// GET /api/inquiries
router.get('/', checkAuth, (req, res) => {
    db.query('SELECT * FROM inquiries ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const { sendEmail } = require('../utils/emailService');
const { loadTemplate } = require('../utils/templateService');

// ... (existing code)

// POST /api/inquiries
router.post('/', (req, res) => {
    const {
        parent_name,
        email,
        phone,
        child_name,
        birth_date,
        requested_grade,
        previous_school,
        marketing_source,
        marketing_source_other
    } = req.body;

    const query = `
        INSERT INTO inquiries (
            parent_name, email, phone, child_name, birth_date, 
            requested_grade, previous_school, marketing_source, marketing_source_other
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query,
        [parent_name, email, phone, child_name, birth_date, requested_grade, previous_school, marketing_source, marketing_source_other],
        async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const inquiryId = result.insertId;

            // Send Confirmation Email to Parent (IMMEDIATE)
            if (email) {
                // 1. Immediate simple confirmation
                const subject = 'Confirmación de Solicitud - Instituto Cultural Terranova';
                const text = `Hola ${parent_name},\n\nHemos recibido su solicitud de informes para el alumno(a) ${child_name}.\n\nNos pondremos en contacto con usted a la brevedad.\n\nAtentamente,\nInstituto Cultural Terranova`;

                const html = loadTemplate('Confirmación (Informes)', {
                    parent_name: parent_name,
                    child_name: child_name,
                    requested_grade: requested_grade
                });

                sendEmail(email, subject, text, html);

                // 2. Scheduled detailed info email (2 MINUTES later)
                // 2 minutes = 120000 ms
                setTimeout(() => {
                    console.log(`Processing scheduled info email for ${email} requesting ${requested_grade}`);

                    let templateName = null;
                    let infoSubject = '';

                    // Determine template based on grade/level
                    // STRICTLY ONLY PREESCOLAR as requested
                    if (requested_grade && requested_grade.toLowerCase().includes('preescolar')) {
                        templateName = 'kinder_info';
                        infoSubject = 'Información Kinder 2025-2026 - Instituto Cultural Terranova';
                    }
                    // Future: Add conditions for Primaria, Secundaria, etc.

                    if (templateName) {
                        const infoText = 'Adjuntamos la información solicitada.';
                        const infoHtml = loadTemplate(templateName, {
                            parent_name: parent_name,
                            child_name: child_name,
                            requested_grade: requested_grade
                        });

                        if (infoHtml) {
                            console.log(`Sending ${templateName} to ${email}`);
                            sendEmail(email, infoSubject, infoText, infoHtml);

                            // UPDATE DATABASE: Mark 'flag_info_sent' as true
                            const updateQuery = 'UPDATE inquiries SET flag_info_sent = 1 WHERE id = ?';
                            db.query(updateQuery, [inquiryId], (updateErr) => {
                                if (updateErr) {
                                    console.error('Error updating inquiry flag:', updateErr);
                                } else {
                                    console.log(`Updated flag_info_sent for inquiry ${inquiryId}`);
                                }
                            });

                        } else {
                            console.error(`Error rendering scheduled template: ${templateName}`);
                        }
                    } else {
                        console.log(`No scheduled template defined for grade: ${requested_grade}`);
                    }

                }, 120000); // 120000 ms = 2 minutes
            }

            // Send Notification to Admin
            const adminEmail = process.env.EMAIL_FROM;
            if (adminEmail) {
                const adminSubject = `Nueva Solicitud de Informes: ${child_name}`;
                const adminText = `Se ha recibido una nueva solicitud:\n\nAlumno: ${child_name}\nGrado: ${requested_grade}\nPadre/Tutor: ${parent_name}\nEmail: ${email}\nTeléfono: ${phone}\nEscuela de Procedencia: ${previous_school}\nFuente: ${marketing_source} ${marketing_source_other ? `(${marketing_source_other})` : ''}`;

                const adminHtml = loadTemplate('admin_notification', {
                    child_name: child_name,
                    requested_grade: requested_grade,
                    parent_name: parent_name,
                    email: email,
                    phone: phone,
                    birth_date: birth_date,
                    previous_school: previous_school,
                    marketing_source: marketing_source,
                    marketing_source_other: marketing_source_other ? `(${marketing_source_other})` : ''
                });

                sendEmail(adminEmail, adminSubject, adminText, adminHtml);
            }

            res.status(201).json({ message: 'Inquiry received', id: result.insertId });
        }
    );
});

// PUT /api/inquiries/:id/checklist
router.put('/:id/checklist', checkAuth, (req, res) => {
    const { id } = req.params;
    const { flag, value } = req.body;

    const validFlags = ['flag_info_sent', 'flag_scheduled', 'flag_evaluation', 'flag_finished'];
    if (!validFlags.includes(flag)) {
        return res.status(400).json({ error: 'Invalid flag' });
    }

    // Convert boolean to 1/0
    const bitValue = value ? 1 : 0;

    const query = `UPDATE inquiries SET ${flag} = ? WHERE id = ?`;


    db.query(query, [bitValue, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Flag updated' });
    });
});

// DELETE /api/inquiries/:id
router.delete('/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM inquiries WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Inquiry deleted' });
    });
});


module.exports = router;
