const fs = require('fs');
const path = require('path');

try {
    const content = fs.readFileSync(path.join(__dirname, '../config/roles.json'), 'utf8');
    const json = JSON.parse(content);
    console.log('✅ roles.json is VALID.');
    console.log('Keys:', Object.keys(json));

    if (json.tutor) {
        console.log('✅ "tutor" role is present.');
    } else {
        console.error('❌ "tutor" role is MISSING.');
    }
} catch (e) {
    console.error('❌ roles.json is INVALID:', e.message);
}
