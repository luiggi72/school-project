const db = require('./config/db');

const query = `
    ALTER TABLE inquiries
    ADD COLUMN flag_info_sent TINYINT(1) DEFAULT 0,
    ADD COLUMN flag_scheduled TINYINT(1) DEFAULT 0,
    ADD COLUMN flag_evaluation TINYINT(1) DEFAULT 0,
    ADD COLUMN flag_finished TINYINT(1) DEFAULT 0;
`;

db.query(query, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist');
        } else {
            console.error('Error adding columns:', err);
        }
    } else {
        console.log('Checklist columns added successfully');
    }
    process.exit();
});
