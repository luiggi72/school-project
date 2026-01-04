require('dotenv').config();
const { sendEmail } = require('./utils/emailService');
const { loadTemplate } = require('./utils/templateService');

const emailTo = 'luis.nachon@hotmail.com';
const subject = 'PRUEBA FINAL: Confirmación de Solicitud (Estilos Corregidos)';
const text = 'Este es un correo de prueba para verificar los colores de la plantilla.';

// Dummy data for the template
const data = {
    parent_name: 'Luis Nachón',
    child_name: 'Hijo de Prueba',
    requested_grade: 'Kinder 1'
};

// Load the template with data
const html = loadTemplate('inquiry_confirmation', data);

if (!html) {
    console.error('Failed to load template');
    process.exit(1);
}

console.log('Sending test email to:', emailTo);
sendEmail(emailTo, subject, text, html).then(info => {
    if (info) {
        console.log('Email sent successfully:', info.messageId);
    } else {
        console.log('Failed to send email.');
    }
});
