const fs = require('fs');
const path = require('path');

/**
 * Loads an HTML template file and replaces placeholders with data.
 * @param {string} templateName - The name of the template file (without extension).
 * @param {object} data - Key-value pairs to replace in the template (e.g., { name: 'Luis' }).
 * @returns {string} - The processed HTML string.
 */
function loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);

    try {
        let template = fs.readFileSync(templatePath, 'utf8');

        // Replace all {{key}} occurrences
        for (const key in data) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, data[key] || '');
        }

        return template;
    } catch (error) {
        console.error(`Error loading template ${templateName}:`, error);
        return '';
    }
}

module.exports = { loadTemplate };
