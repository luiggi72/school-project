const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');
const path = require('path');

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

                    let templateName = '';
                    let infoSubject = 'Información Instituto Cultural Terranova';
                    let attachmentFilename = '';
                    let inquiryLevel = 'General'; // Default

                    // Determine template based on grade/level
                    const grade = requested_grade ? requested_grade.toLowerCase() : '';

                    if (grade.includes('maternal')) {
                        templateName = 'maternal_info';
                        infoSubject = 'Información Maternal - Instituto Cultural Terranova';
                        attachmentFilename = 'PRE_Y_MAT_26-27_HOJAS_DE_INFORMES-1768501599612.pdf';
                        inquiryLevel = 'Maternal';
                    } else if (grade.includes('kinder') || grade.includes('preescolar') || grade.includes('kínder')) {
                        templateName = 'kinder_info';
                        infoSubject = 'Información Preescolar - Instituto Cultural Terranova';
                        attachmentFilename = 'KINDER_26-27_HOJAS_DE_INFORMES-1768501488233.pdf';
                        inquiryLevel = 'Preescolar';
                    } else if (grade.includes('primaria')) {
                        templateName = 'primaria_info';
                        infoSubject = 'Información Primaria - Instituto Cultural Terranova';
                        attachmentFilename = 'PRIMARIA_26-27_HOJA_DE_INFORMES-1768501619015.pdf';
                        inquiryLevel = 'Primaria';
                    } else if (grade.includes('secundaria')) {
                        templateName = 'secundaria_info';
                        infoSubject = 'Información Secundaria - Instituto Cultural Terranova';
                        attachmentFilename = 'SECUNDARIA_26-27_HOJAS_DE_INFORMES-1768501632803.pdf';
                        inquiryLevel = 'Secundaria';
                    } else if (grade.includes('preparatoria') || grade.includes('bachillerato')) {
                        templateName = 'preparatoria_info';
                        infoSubject = 'Información Preparatoria - Instituto Cultural Terranova';
                        // No specific PDF found for Preparatoria yet
                        inquiryLevel = 'Preparatoria';
                    }

                    if (templateName) {
                        const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
                        let attachmentButton = '';

                        if (attachmentFilename) {
                            const url = `${publicUrl}/uploads/${attachmentFilename}`;
                            // Call to Action: Download (Simple Text Link)
                            attachmentButton = `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" target="_blank" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #64748b; text-decoration: underline;">
                                        Información Adjunta
                                    </a>
                                    </td>
                                </tr>
                            </table>`;
                        }

                        // NEW: Generate Booking Button - Obfuscated
                        const bookingData = {
                            parent_name: parent_name,
                            email: email,
                            phone: phone,
                            child_name: child_name,
                            grade: requested_grade,
                            level: inquiryLevel,
                            birth_date: birth_date || '',
                            previous_school: previous_school || '',
                            marketing_source: marketing_source || ''
                        };

                        const base64Data = Buffer.from(JSON.stringify(bookingData)).toString('base64');
                        const bookingUrl = `${publicUrl}/agendar_cita.html?data=${base64Data}`;

                        // Call to Action: Book Appointment (Simple Red Text Link)
                        const bookingButton = `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${bookingUrl}" target="_blank" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #E31E25; text-decoration: none; font-weight: bold;">
                                            Agendar Cita de Visita
                                        </a>
                                        <p style="text-align: center; margin-top: 5px; font-family: sans-serif; font-size: 12px; color: #94a3b8;">
                                            Clic aquí para seleccionar fecha.
                                        </p>
                                    </td>
                                </tr>
                            </table>`;

                        const infoText = 'Adjuntamos la información solicitada.';
                        const infoHtml = loadTemplate(templateName, {
                            parent_name: parent_name,
                            child_name: child_name,
                            requested_grade: requested_grade,
                            attachment_button: attachmentButton,
                            booking_button: bookingButton // Inject new button
                        });

                        // const attachments = [];
                        // if (attachmentFilename) {
                        //     attachments.push({
                        //         filename: 'Información_Admisiones.pdf',
                        //         path: path.join(__dirname, '../public/uploads', attachmentFilename)
                        //     });
                        // }

                        if (infoHtml) {
                            console.log(`Sending ${templateName} to ${email} with download button: ${attachmentFilename}`);
                            // Pass empty attachments array (or rely on default logo in emailService)
                            // We do NOT attach the PDF file itself anymore
                            sendEmail(email, infoSubject, infoText, infoHtml, []);

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
