
const db = require('../config/db');

const subgrades = {
    'MATERNAL': ['Maternal 1', 'Maternal 2'],
    'PREESCOLAR': ['1º', '2º', '3º'],
    'PRIMARIA': ['1º', '2º', '3º', '4º', '5º', '6º'],
    'SECUNDARIA': ['1º', '2º', '3º'],
    'BACHILLERATO': ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre']
};

const classrooms = {
    'PRIMARIA': {
        '1º': ['OCEANO', 'RIO', 'LAGO'],
        '2º': ['SELVA', 'JUNGLA', 'MANGLAR'],
        '3º': ['ESTEPA', 'GLACIAR', 'TUNDRA'],
        '4º': ['CAMPIÑA', 'SABANA', 'PRADERA'],
        '5º': ['MONTAÑA', 'BOSQUE', 'FORESTA'],
        '6º': ['TIERRA', 'AIRE', 'AGUA']
    }
};

const defaultGroups = ['A', 'B'];

const seed = async () => {
    try {
        console.log('Cleaning existing academic data...');
        await db.promise().query('DELETE FROM academic_groups');
        await db.promise().query('DELETE FROM academic_grades'); // Cascade should handle groups but explicit is safer logic wise if no cascade
        // Actually FK implies we delete grades then groups gone? No, delete groups first.

        // 1. Get Levels
        const [levels] = await db.promise().query('SELECT id, name FROM academic_levels');
        console.log('Found levels:', levels);

        for (const level of levels) {
            const levelName = level.name.toUpperCase();
            const gradesList = subgrades[levelName] || [];

            for (const gradeName of gradesList) {
                // Create Grade
                const [res] = await db.promise().query(
                    'INSERT INTO academic_grades (name, level_id) VALUES (?, ?)',
                    [gradeName, level.id]
                );
                const gradeId = res.insertId;
                console.log(`Created Grade: ${gradeName} for ${levelName}`);

                // Determine Groups
                let groupsList = defaultGroups;
                if (classrooms[levelName] && classrooms[levelName][gradeName]) {
                    groupsList = classrooms[levelName][gradeName];
                }

                // Create Groups
                for (const groupName of groupsList) {
                    await db.promise().query(
                        'INSERT INTO academic_groups (name, grade_id) VALUES (?, ?)',
                        [groupName, gradeId]
                    );
                    console.log(`  -> Created Group: ${groupName}`);
                }
            }
        }
        console.log('Seeding complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
