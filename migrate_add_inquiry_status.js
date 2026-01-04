const db = require('./config/db');

const query = `
    ALTER TABLE inquiries
    ADD COLUMN follow_up_status VARCHAR(50) DEFAULT 'Información Enviada';
`;

db.query(query, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error('Error adding column:', err);
        }
    } else {
        console.log('Column added successfully');
    }
    process.exit();
});
