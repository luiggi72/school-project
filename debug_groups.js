const db = require('./config/db');

const testLevelId = 3; // Primaria

const query = `
    SELECT l.name as LevelName, COUNT(g.id) as GroupCount
    FROM academic_levels l
    LEFT JOIN academic_grades gr ON l.id = gr.level_id
    LEFT JOIN academic_groups g ON gr.id = g.grade_id
    GROUP BY l.id, l.name
`;

console.log('Checking Group Distribution by Level:');
db.query(query, [], (err, results) => {
    if (err) console.error(err);
    console.table(results);
    process.exit();
});
