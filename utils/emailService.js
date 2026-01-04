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

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../public/logo.png'),
                cid: 'school_logo'
            }]
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        return null;
    }
}

async function sendParentWelcomeEmail(to, username, password) {
    try {
        const templatePath = path.join(__dirname, '../templates/parent_welcome.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders
        html = html.replace('{{username}}', username)
            .replace('{{password}}', password)
            // Assuming localhost for now as per dev env, or env var
            .replace('{{loginLink}}', process.env.PUBLIC_URL || 'http://localhost:3000'); // Fallback

        return await sendEmail(to, 'Bienvenido al Portal de Padres - Credenciales de Acceso',
            `Bienvenido. Tu usuario es: ${username} y tu contraseña temporal: ${password}`, html);

    } catch (e) {
        console.error('Error preparing welcome email:', e);
        return null;
    }
}

module.exports = { sendEmail, sendParentWelcomeEmail };
