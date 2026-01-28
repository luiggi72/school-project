const http = require('http');

const filename = 'PRIMARIA_26-27_HOJA_DE_INFORMES-1768501619015.pdf';
const url = `http://192.168.10.181:3000/uploads/${filename}`;

console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content Type: ${res.headers['content-type']}`);
    console.log(`Content Length: ${res.headers['content-length']}`);

    if (res.statusCode === 200) {
        console.log('SUCCESS: File is accessible.');
    } else {
        console.log('FAILURE: Copuld not access file.');
    }
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
