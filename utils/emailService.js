const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // 587 or 465
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const fs = require('fs');

async function sendEmail(to, subject, text, html, attachments = []) {
    try {
        const defaultAttachments = [{
            filename: 'logo.png',
            path: path.join(__dirname, '../public/logo.png'),
            cid: 'school_logo'
        }];

        const finalAttachments = [...defaultAttachments, ...attachments];

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            attachments: finalAttachments
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        return null;
    }
}

const db = require('../config/db');

// Helper to get rule-based attachments
async function getSmartAttachments(templateName, context = {}) {
    return new Promise((resolve) => {
        const { grade } = context;
        let query = "SELECT file_name FROM attachment_rules WHERE template_name = ? AND (grade_condition IS NULL OR grade_condition = '')";
        let params = [templateName];

        if (grade) {
            query = "SELECT file_name FROM attachment_rules WHERE template_name = ? AND (grade_condition IS NULL OR grade_condition = '' OR grade_condition = ?)";
            params.push(grade);
        }

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error fetching smart attachments:', err);
                resolve([]);
                return;
            }

            const attachments = results.map(row => ({
                filename: row.file_name, // Name displayed in email
                path: path.join(__dirname, '../public/uploads', row.file_name)
            })).filter(att => fs.existsSync(att.path)); // Only attach if file exists

            if (attachments.length > 0) {
                console.log(`[SmartAttachments] Found ${attachments.length} files for template '${templateName}' with grade '${grade || 'N/A'}'`);
            }
            resolve(attachments);
        });
    });
}

async function sendParentWelcomeEmail(to, username, password, studentContext = {}) {
    try {
        const templateName = 'parent_welcome';
        const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders
        html = html.replace('{{username}}', username)
            .replace('{{password}}', password)
            .replace('{{loginLink}}', process.env.PUBLIC_URL || 'http://localhost:3000');

        // Fetch smart attachments based on student context (e.g., Grade)
        const smartAttachments = await getSmartAttachments(templateName, studentContext);

        return await sendEmail(to, 'Bienvenido al Portal de Padres - Credenciales de Acceso',
            `Bienvenido. Tu usuario es: ${username} y tu contraseña temporal: ${password}`, html, smartAttachments);

    } catch (e) {
        console.error('Error preparing welcome email:', e);
        return null;
    }
}

module.exports = { sendEmail, sendParentWelcomeEmail };
