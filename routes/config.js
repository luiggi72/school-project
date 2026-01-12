const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { loadTemplate } = require('../utils/templateService');
const db = require('../config/db');

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
    console.log(`[DEBUG] Requesting template: ${templateName}`);
    console.log(`[DEBUG] User Data:`, req.userData);


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

// GET /api/config/templates/:name/raw
// Returns the RAW HTML content for editing
router.get('/templates/:name/raw', (req, res) => {
    const templateName = req.params.name;
    // Basic security check to prevent path traversal
    if (templateName.includes('..') || templateName.includes('/')) {
        return res.status(400).json({ error: 'Invalid template name' });
    }

    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ error: 'Template not found' });
    }

    try {
        const content = fs.readFileSync(templatePath, 'utf8');
        res.json({ content });
    } catch (error) {
        console.error('Error reading raw template:', error);
        res.status(500).json({ error: 'Could not read template file' });
    }
});

// PUT /api/config/templates/:name
// Saves updated template content
router.put('/templates/:name', (req, res) => {
    const templateName = req.params.name;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    // Security check
    if (templateName.includes('..') || templateName.includes('/')) {
        return res.status(400).json({ error: 'Invalid template name' });
    }

    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);

    try {
        fs.writeFileSync(templatePath, content, 'utf8');
        res.json({ message: 'Template saved successfully' });
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Could not save template file' });
    }
});

// POST /api/config/templates
// Creates a new template
router.post('/templates', (req, res) => {
    const { name, content } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    console.log(`[DEBUG] Creating template: ${name}`);

    // Validate name (alphanumeric, underscores, dashes, spaces, accents, parens, dots)
    if (!/^[a-zA-Z0-9_\-\s\u00C0-\u00FF\(\)\.]+$/.test(name)) {
        return res.status(400).json({ error: 'Invalid name. Allowed: letters, numbers, spaces, -, _, (), ., accents' });
    }

    const templatePath = path.join(__dirname, '../templates', `${name}.html`);
    if (fs.existsSync(templatePath)) {
        return res.status(400).json({ error: 'Template already exists' });
    }

    const initialContent = content || `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Plantilla</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: Arial, sans-serif; color: #555555;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f6f6;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 30px 20px; border-bottom: 3px solid #E31E25; background-color: #ffffff;">
                            <img src="cid:school_logo" alt="Logo Colegio" style="display: block; max-height: 150px; border: 0; outline: none; text-decoration: none;" />
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #ffffff; text-align: left;">
                            <h2 style="font-size: 20px; color: #000000; margin: 0 0 20px 0; font-weight: bold;">
                                Título del Mensaje
                            </h2>
                            <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 25px 0;">
                                Escribe aquí el contenido de tu correo...
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #9C9E9D; border-top: 3px solid #E31E25; background-color: #ffffff;">
                            <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
                                Colegio Cultural Terranova
                            </p>
                            <p style="margin: 5px 0; font-size: 12px;">
                                <a href="https://www.culturalterranova.edu.mx" style="color: #E31E25; text-decoration: none; font-weight: bold;">www.culturalterranova.edu.mx</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    try {
        fs.writeFileSync(templatePath, initialContent, 'utf8');
        res.json({ message: 'Template created', name });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// POST /api/config/templates/:name/rename
// Renames a template
router.post('/templates/:name/rename', (req, res) => {
    const oldName = req.params.name;
    const { newName } = req.body;

    console.log(`[DEBUG] Renaming template: ${oldName} to ${newName}`);

    if (!newName) return res.status(400).json({ error: 'New name is required' });
    if (!/^[a-zA-Z0-9_\-\s\u00C0-\u00FF\(\)\.]+$/.test(newName)) {
        return res.status(400).json({ error: 'Invalid name format (Allowed: letters, numbers, spaces, -, _, (), ., accents)' });
    }

    const oldPath = path.join(__dirname, '../templates', `${oldName}.html`);
    const newPath = path.join(__dirname, '../templates', `${newName}.html`);

    if (!fs.existsSync(oldPath)) {
        return res.status(404).json({ error: 'Template not found' });
    }
    if (fs.existsSync(newPath)) {
        return res.status(400).json({ error: 'A template with that name already exists' });
    }

    try {
        fs.renameSync(oldPath, newPath);
        res.json({ message: 'Template renamed', newName });
    } catch (error) {
        console.error('Error renaming template:', error);
        res.status(500).json({ error: 'Failed to rename template' });
    }
});

// DELETE /api/config/templates/:name
// Deletes a template
router.delete('/templates/:name', (req, res) => {
    const templateName = req.params.name;
    console.log(`[DEBUG] Deleting template: ${templateName}`);

    if (templateName.includes('..') || templateName.includes('/')) {
        return res.status(400).json({ error: 'Invalid name' });
    }

    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ error: 'Template not found' });
    }

    try {
        fs.unlinkSync(templatePath);
        res.json({ message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// POST /api/config/test-email
// Sends a test email with the selected template
router.post('/test-email', upload.single('attachment'), async (req, res) => {
    const { email, template } = req.body;
    const { sendEmail } = require('../utils/emailService');

    if (!email || !template) {
        return res.status(400).json({ error: 'Email and template are required' });
    }

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

    // Handle Attachment
    let attachments = [];
    if (req.file) {
        attachments.push({
            filename: req.file.originalname,
            content: req.file.buffer
        });
    }

    try {
        const info = await sendEmail(email, subject, text, html, attachments);
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
