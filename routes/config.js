const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { loadTemplate } = require('../utils/templateService');

// GET /api/config/templates
// Returns a list of available template names
router.get('/templates', (req, res) => {
    const templatesDir = path.join(__dirname, '../templates');
    fs.readdir(templatesDir, (err, files) => {
        if (err) {
            console.error('Error reading templates directory:', err);
            return res.status(500).json({ error: 'Could not list templates' });
        }

        // Filter for .html files and remove extension
        const templates = files
            .filter(file => file.endsWith('.html'))
            .map(file => file.replace('.html', ''));

        res.json(templates);
    });
});

// GET /api/config/templates/:name
// Returns the HTML content of a specific template with dummy data
router.get('/templates/:name', (req, res) => {
    const templateName = req.params.name;

    // Dummy data for preview
    const dummyData = {
        parent_name: 'Juan Pérez',
        child_name: 'Mateo Pérez',
        requested_grade: '3º Primaria',
        email: 'juan.perez@email.com',
        phone: '55 1234 5678',
        birth_date: '2015-05-15',
        previous_school: 'Colegio Anterior',
        marketing_source: 'Redes Sociales',
        marketing_source_other: '(Facebook)'
    };

    const html = loadTemplate(templateName, dummyData);

    // Check if loadTemplate returned empty string (error)
    if (!html) {
        return res.status(404).json({ error: 'Template not found' });
    }

    res.send(html);
});

// POST /api/config/test-email
// Sends a test email with the selected template
router.post('/test-email', async (req, res) => {
    const { email, template } = req.body;
    const { sendEmail } = require('../utils/emailService'); // Lazy load to avoid circular deps if any

    if (!email || !template) {
        return res.status(400).json({ error: 'Email and template are required' });
    }

    // Dummy data for preview/test
    const dummyData = {
        parent_name: 'Usuario de Prueba',
        child_name: 'Alumno de Prueba',
        requested_grade: '3º Primaria',
        email: email,
        phone: '55 1234 5678',
        birth_date: '2015-05-15',
        previous_school: 'Colegio Anterior',
        marketing_source: 'Redes Sociales',
        marketing_source_other: '(Facebook)'
    };

    const html = loadTemplate(template, dummyData);

    if (!html) {
        return res.status(404).json({ error: 'Template not found' });
    }

    const subject = `PRUEBA: ${template} - Sistema Escolar`;
    const text = 'Este es un correo de prueba enviado desde el sistema escolar.';

    try {
        const info = await sendEmail(email, subject, text, html);
        if (info) {
            res.json({ message: 'Email sent successfully', messageId: info.messageId });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Internal server error sending email' });
    }
});

const ROLES_PATH = path.join(__dirname, '../config/roles.json');

// ... existing email test code ...

// GET /api/config/roles
router.get('/roles', (req, res) => {
    try {
        if (fs.existsSync(ROLES_PATH)) {
            const data = fs.readFileSync(ROLES_PATH, 'utf8');
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
            res.json(JSON.parse(data));
        } else {
            res.json({});
        }
    } catch (error) {
        res.status(500).json({ error: 'Error reading roles config' });
    }
});

// PUT /api/config/roles
router.put('/roles', (req, res) => {
    try {
        const newRoles = req.body;
        // Basic validation could go here
        fs.writeFileSync(ROLES_PATH, JSON.stringify(newRoles, null, 4));
        res.json({ message: 'Roles updated successfully' });
    } catch (error) {
        console.error('Error writing roles:', error);
        res.status(500).json({ error: 'Error updating roles config' });
    }
});

const CHATBOT_CONFIG_PATH = path.join(__dirname, '../config/chatbot.json');

// GET /api/config/chatbot
router.get('/chatbot', (req, res) => {
    try {
        if (fs.existsSync(CHATBOT_CONFIG_PATH)) {
            const data = fs.readFileSync(CHATBOT_CONFIG_PATH, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({ apiKey: '', context: '' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error reading chatbot config' });
    }
});

// PUT /api/config/chatbot
router.put('/chatbot', (req, res) => {
    try {
        const { apiKey, context } = req.body;
        // Basic validation
        const config = { apiKey, context };
        fs.writeFileSync(CHATBOT_CONFIG_PATH, JSON.stringify(config, null, 4));
        res.json({ message: 'Chatbot config updated successfully' });
    } catch (error) {
        console.error('Error updating chatbot config:', error);
        res.status(500).json({ error: 'Error updating chatbot config' });
    }
});

module.exports = router;
