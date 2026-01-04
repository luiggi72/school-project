const db = require('./config/db');

db.query('SELECT DISTINCT grade FROM students', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Distinct Grades:', results);
    }
    process.exit();
});
