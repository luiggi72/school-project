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

const PDFDocument = require('pdfkit-table');

// GET /api/inquiries/export-pdf
router.get('/export-pdf', checkAuth, (req, res) => {
    // Advanced query to try and link inquiries to appointments based on email match in description or just email
    // Since we don't have a direct FK, we'll try to match by email which is stored in the appointment description or potentially just assume linkage by email if unique enough.
    // Better yet, let's look for appointments where the description LIKE '%Email: <email>%'.

    // NOTE: Matching strings in JSON or Description is slow but acceptable for reports.
    // A cleaner way is: "(SELECT start_time FROM appointments WHERE description LIKE CONCAT('%', inquiries.email, '%') ORDER BY start_time DESC LIMIT 1) as appointment_date"

    const { level, status } = req.query;

    let whereClauses = [];
    let params = [];
    let subtitleExtras = [];

    // Filter by Level (Grade)
    if (level && level !== 'All') {
        whereClauses.push("requested_grade LIKE ?");
        params.push(`%${level}%`);
        subtitleExtras.push(`Nivel: ${level}`);
    }

    // Filter by Status (Confirmed)
    // We check flag_scheduled = 1 which implies an appointment was booked
    if (status === 'confirmed') {
        whereClauses.push("flag_scheduled = 1");
        subtitleExtras.push("Solo Citas Confirmadas");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
        SELECT 
            inquiries.*,
            (
                SELECT start_time 
                FROM appointments 
                WHERE description LIKE CONCAT('%', inquiries.email, '%') 
                ORDER BY start_time DESC 
                LIMIT 1
            ) as appointment_date
        FROM inquiries 
        ${whereSql}
        ORDER BY created_at DESC
    `;

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).send(err.message);

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=reporte_informes.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(16).text('Reporte de Solicitudes de Informes', { align: 'center' });
        doc.moveDown();

        // Table
        const table = {
            title: "Listado Completo",
            subtitle: "Generado el: " + (() => {
                const now = new Date();
                const d = String(now.getDate()).padStart(2, '0');
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const y = String(now.getFullYear()).slice(-2);
                const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                let t = `Generado el: ${d}/${m}/${y} ${time}`;
                if (subtitleExtras.length > 0) {
                    t += `\nFiltros: ${subtitleExtras.join(' | ')}`;
                }
                return t;
            })(),
            headers: [
                { label: "Fecha Solicitud", property: "date", width: 65 },
                { label: "Alumno", property: "child_name", width: 130 },
                { label: "Grado", property: "grade", width: 80 },
                { label: "Padre/Tutor", property: "parent", width: 120 },
                { label: "Teléfono", property: "phone", width: 80 },
                { label: "Email", property: "email", width: 140 },
                { label: "Fuente", property: "source", width: 80 },
                { label: "Fecha Cita", property: "appointment", width: 85 }
            ],
            datas: results.map(row => ({
                date: (() => {
                    const dObj = new Date(row.created_at);
                    const d = String(dObj.getDate()).padStart(2, '0');
                    const m = String(dObj.getMonth() + 1).padStart(2, '0');
                    const y = String(dObj.getFullYear()).slice(-2);
                    return `${d}/${m}/${y}`;
                })(),
                child_name: row.child_name,
                grade: row.requested_grade,
                parent: row.parent_name,
                phone: row.phone,
                email: row.email,
                source: row.marketing_source,
                appointment: row.appointment_date ? (() => {
                    const dObj = new Date(row.appointment_date);
                    const d = String(dObj.getDate()).padStart(2, '0');
                    const m = String(dObj.getMonth() + 1).padStart(2, '0');
                    const y = String(dObj.getFullYear()).slice(-2);
                    const time = dObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    return `${d}/${m}/${y} ${time}`;
                })() : 'Sin Cita'
            })),
        };

        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(8)
        });

        doc.end();
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

                        // combinedButtons logic
                        let combinedButtons = '';

                        // Define Booking Button (Primary)
                        const bookingBtnHtml = `
                                <a href="${bookingUrl}" target="_blank" style="display: inline-block; background-color: #E31E25; color: #ffffff; padding: 14px 20px; border-radius: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(227, 30, 37, 0.2); width: 100%; box-sizing: border-box; text-align: center;">
                                    Agendar Visita
                                </a>`;

                        // Define Attachment Button (Secondary)
                        let attachmentBtnHtml = '';
                        if (attachmentFilename) {
                            const url = `${publicUrl}/uploads/${attachmentFilename}`;
                            attachmentBtnHtml = `
                                <a href="${url}" target="_blank" style="display: inline-block; background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; padding: 14px 20px; border-radius: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; text-decoration: none; font-weight: 500; width: 100%; box-sizing: border-box; text-align: center;">
                                    Descargar Info
                                </a>`;
                        }

                        // Construct Horizontal Layout Table
                        combinedButtons = `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 30px 0;">
                                <tr>
                                    ${attachmentBtnHtml ? `
                                    <td width="48%" valign="top" style="padding-right: 2%;">
                                        ${attachmentBtnHtml}
                                    </td>` : ''}
                                    <td width="${attachmentBtnHtml ? '48%' : '100%'}" valign="top" style="${attachmentBtnHtml ? 'padding-left: 2%;' : ''}">
                                        ${bookingBtnHtml}
                                    </td>
                                </tr>
                            </table>`;

                        // Hack: Set attachmentButton to empty string, pass everything in bookingButton
                        attachmentButton = '';
                        const bookingButton = combinedButtons;

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
                    birth_date: birth_date ? (() => {
                        const [y, m, d] = birth_date.split('-');
                        return y && m && d ? `${d}/${m}/${y.substring(2)}` : birth_date;
                    })() : '',
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
