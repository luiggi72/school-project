const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const forms = require('./eval_forms_config');

const PROJECT_ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(PROJECT_ROOT, 'routes');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public', 'evaluaciones');

if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function generateForm(form) {
    console.log(`\nGenerating system for: ${form.title} (${form.id})...`);

    // 1. DATABASE TABLE
    let createTableSQL = `CREATE TABLE IF NOT EXISTS ${form.id} (\n`;
    createTableSQL += `    id INT AUTO_INCREMENT PRIMARY KEY,\n`;
    createTableSQL += `    student_id INT NULL,\n`;
    createTableSQL += `    student_name VARCHAR(255) NOT NULL,\n`;
    createTableSQL += `    application_date DATE,\n`;
    if (form.grade_field) createTableSQL += `    current_grade VARCHAR(100),\n`;
    createTableSQL += `    previous_school VARCHAR(255),\n`;

    // Indicators and Observations
    form.sections.forEach(section => {
        createTableSQL += `    ${section.id}_indicators JSON,\n`;
        if (section.observation) createTableSQL += `    ${section.id}_observations TEXT,\n`;
        if (section.extra_fields) {
            section.extra_fields.forEach(field => {
                createTableSQL += `    ${field.name} TEXT,\n`;
            });
        }
    });

    createTableSQL += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    createTableSQL += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    await new Promise((resolve, reject) => {
        db.query(createTableSQL, (err) => {
            if (err) return reject(err);
            console.log(`[DB] Table ${form.id} created/verified.`);
            resolve();
        });
    });

    // 2. BACKEND ROUTE (Constructing string manually to avoid nesting issues)
    let indicatorsMapping = form.sections.map(s => {
        let parts = [`JSON.stringify(data.${s.id}_indicators)`];
        if (s.observation) parts.push(`data.${s.id}_observations`);
        if (s.extra_fields) parts.push(...s.extra_fields.map(f => `data.${f.name}`));
        return parts.join(', ');
    }).join(', ');

    let fieldsMapping = form.sections.map(s => {
        let fields = [s.id + '_indicators'];
        if (s.observation) fields.push(s.id + '_observations');
        if (s.extra_fields) fields.push(...s.extra_fields.map(f => f.name));
        return fields.join(', ');
    }).join(', ');

    let paramsMapping = form.sections.map(s => {
        let count = 1; // indicator
        if (s.observation) count++;
        if (s.extra_fields) count += s.extra_fields.length;
        return Array(count).fill('?').join(', ');
    }).join(', ');

    let gradeField = form.grade_field ? ', current_grade' : '';
    let gradeParam = form.grade_field ? ', ?' : '';
    let gradeValue = form.grade_field ? ', data.current_grade' : '';

    const routeContent = `const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/auth');

router.post('/', checkAuth, (req, res) => {
    const data = req.body;
    const query = "INSERT INTO ${form.id} (student_name, application_date, previous_school${gradeField}, ${fieldsMapping}) VALUES (?, ?, ?${gradeParam}, ${paramsMapping})";
    const values = [data.student_name, data.application_date, data.previous_school${gradeValue}, ${indicatorsMapping}];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving:', err);
            return res.status(500).json({ error: 'Error al guardar' });
        }
        res.status(201).json({ message: 'Guardado', id: result.insertId });
    });
});
module.exports = router;`;

    fs.writeFileSync(path.join(ROUTES_DIR, `${form.id}.js`), routeContent);
    console.log(`[BACKEND] Route routes/${form.id}.js created.`);

    // 3. FRONTEND HTML
    let tableRows = '';
    form.sections.forEach(section => {
        tableRows += `<h2>${section.title}</h2>`;
        if (section.legend) {
            tableRows += `<p class="legend">${section.legend}</p>`;
        }
        tableRows += `<table><thead><tr><th style="width: 60%">Indicador</th>`;
        section.headers.forEach(h => { tableRows += `<th class="center">${h}</th>`; });
        tableRows += `</tr></thead><tbody id="table_${section.id}"></tbody></table>`;

        if (section.extra_fields) {
            tableRows += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">`;
            section.extra_fields.forEach(field => {
                if (field.type !== 'textarea') {
                    tableRows += `<div class="form-group"><label>${field.label}:</label><input type="text" name="${field.name}"></div>`;
                }
            });
            tableRows += `</div>`;
            section.extra_fields.forEach(field => {
                if (field.type === 'textarea') {
                    tableRows += `<div class="form-group"><label>${field.label}:</label><textarea name="${field.name}" rows="3"></textarea></div>`;
                }
            });
        }
        if (section.observation) {
            tableRows += `<div class="form-group"><label>Observaciones:</label><textarea name="${section.id}_observations" rows="3"></textarea></div>`;
        }
    });

    // JS Parts
    let jsIndicators = 'const indicators = {\n';
    form.sections.forEach(s => {
        jsIndicators += `        ${s.id}: ${JSON.stringify(s.items)},\n`;
    });
    jsIndicators += '    };';

    let jsInit = '';
    form.sections.forEach(s => {
        jsInit += `    generateRows('table_${s.id}', indicators.${s.id}, '${s.id}', ${JSON.stringify(s.headers)});\n`;
    });

    let jsPayload = '';
    if (form.grade_field) jsPayload += `            current_grade: formData.get('current_grade'),\n`;
    form.sections.forEach(s => {
        jsPayload += `            ${s.id}_indicators: collectIndicators(indicators.${s.id}.length, '${s.id}'),\n`;
        if (s.observation) jsPayload += `            ${s.id}_observations: formData.get('${s.id}_observations'),\n`;
        if (s.extra_fields) {
            s.extra_fields.forEach(f => {
                jsPayload += `            ${f.name}: formData.get('${f.name}'),\n`;
            });
        }
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${form.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <style>
        html, body { background-color: #f3f4f6; padding: 20px; overflow-y: auto !important; height: auto !important; }
        .container { max-width: 900px; margin: 0 auto 50px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #111827; margin-bottom: 30px; font-weight: 700; }
        h2 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 40px; margin-bottom: 20px; font-size: 1.5rem; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: 500; margin-bottom: 5px; color: #374151; }
        input[type="text"], input[type="date"], textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Outfit', sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; vertical-align: middle; }
        th { background-color: #f9fafb; font-weight: 600; color: #374151; }
        th.center, td.center { text-align: center; }
        .legend { color: #6b7280; font-style: italic; margin-bottom: 15px; font-size: 0.95rem; margin-top: -15px; }
        .btn-submit { display: block; width: 100%; background-color: #4f46e5; color: white; font-weight: 600; text-align: center; padding: 15px; border-radius: 8px; border: none; cursor: pointer; font-size: 1.1rem; margin-top: 30px; }
        .btn-submit:hover { background-color: #4338ca; }
    </style>
</head>
<body>
<div class="container">
    <h1>${form.title}</h1>
    <form id="evaluationForm">
        <div class="grid grid-cols-2 gap-4" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>Nombre del Alumno:</label><input type="text" name="student_name" required></div>
            <div class="form-group"><label>Fecha de Aplicación:</label><input type="date" name="application_date" required></div>
            ${form.grade_field ? '<div class="form-group"><label>Grado que cursa:</label><input type="text" name="current_grade"></div>' : ''}
            <div class="form-group"><label>Escuela de Procedencia:</label><input type="text" name="previous_school"></div>
        </div>
        ${tableRows}
        <button type="submit" class="btn-submit">Guardar Evaluación</button>
    </form>
</div>
<script>
    ${jsIndicators}

    function generateRows(tableId, items, prefix, values) {
        const tbody = document.getElementById(tableId);
        items.forEach((item, index) => {
            const tr = document.createElement('tr');
            const name = prefix + '_' + index;
            let cells = '<td>' + item + '</td>';
            values.forEach(val => {
                cells += '<td class="center"><input type="radio" name="' + name + '" value="' + val + '" required></td>';
            });
            tr.innerHTML = cells;
            tbody.appendChild(tr);
        });
    }

    ${jsInit}

    document.getElementById('evaluationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const collectIndicators = (count, prefix) => {
            const arr = [];
            for(let i=0; i<count; i++) arr.push(formData.get(prefix + '_' + i) || null);
            return arr;
        };

        const payload = {
            student_name: formData.get('student_name'),
            application_date: formData.get('application_date'),
            previous_school: formData.get('previous_school'),
${jsPayload}
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/${form.id}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) { alert('Guardado correctamente!'); window.location.reload(); }
            else { alert('Error: ' + data.error); }
        } catch (err) { console.error(err); alert('Error de conexión'); }
    });
    
    document.querySelector('input[name="application_date"]').valueAsDate = new Date();
</script>
</body>
</html>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, `${form.id}.html`), html);
    console.log(`[FRONTEND] File évaluations/${form.id}.html created.`);
}

async function run() {
    for (const form of forms) {
        await generateForm(form);
    }
    console.log('\nAll forms generated successfully.');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
