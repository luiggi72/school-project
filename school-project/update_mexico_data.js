const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/cisnerosnow/json-estados-municipios-mexico/master/estados-municipios.json';
const outputFile = 'public/mexico_data.js';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            const fileContent = `const MEXICO_DATA = ${JSON.stringify(jsonData, null, 4)};`;

            fs.writeFileSync(outputFile, fileContent);
            console.log(`Successfully updated ${outputFile}`);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });

}).on('error', (err) => {
    console.error('Error downloading data:', err);
});
