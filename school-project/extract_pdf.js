const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, 'pdf_uploads', 'KINDER 25-26 HOJA DE INFORMES.pdf');

let dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log('--- START PDF TEXT ---');
    console.log(data.text);
    console.log('--- END PDF TEXT ---');
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
