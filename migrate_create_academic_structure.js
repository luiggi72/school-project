const db = require('./config/db');

const createTables = async () => {
    try {
        const queries = [
            `CREATE TABLE IF NOT EXISTS academic_levels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )`,
            `CREATE TABLE IF NOT EXISTS academic_grades (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                level_id INT NOT NULL,
                FOREIGN KEY (level_id) REFERENCES academic_levels(id) ON DELETE CASCADE,
                UNIQUE KEY unique_grade_level (name, level_id)
            )`,
            `CREATE TABLE IF NOT EXISTS academic_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                grade_id INT NOT NULL,
                FOREIGN KEY (grade_id) REFERENCES academic_grades(id) ON DELETE CASCADE,
                UNIQUE KEY unique_group_grade (name, grade_id)
            )`
        ];

        for (const query of queries) {
            await db.promise().query(query);
            console.log('Query executed successfully');
        }

        console.log('Academic structure tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
