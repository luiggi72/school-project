const db = require('./config/db');

const createTables = async () => {
    try {
        const queries = [
            `CREATE TABLE IF NOT EXISTS admin_areas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )`,
            `CREATE TABLE IF NOT EXISTS admin_subareas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                area_id INT NOT NULL,
                FOREIGN KEY (area_id) REFERENCES admin_areas(id) ON DELETE CASCADE,
                UNIQUE KEY unique_subarea_area (name, area_id)
            )`,
            `CREATE TABLE IF NOT EXISTS admin_positions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                subarea_id INT NOT NULL,
                FOREIGN KEY (subarea_id) REFERENCES admin_subareas(id) ON DELETE CASCADE,
                UNIQUE KEY unique_position_subarea (name, subarea_id)
            )`
        ];

        for (const query of queries) {
            await db.promise().query(query);
            console.log('Query executed successfully');
        }

        console.log('Administrative structure tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
