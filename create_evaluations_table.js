const db = require('./config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS evaluations_2_to_3 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    student_name VARCHAR(255) NOT NULL,
    application_date DATE,
    current_grade VARCHAR(100),
    previous_school VARCHAR(255),
    spanish_indicators JSON,
    math_indicators JSON,
    science_indicators JSON,
    academic_observations TEXT,
    english_indicators JSON,
    english_percentage_reception VARCHAR(100),
    english_percentage_production VARCHAR(100),
    english_observations TEXT,
    psycho_indicators JSON,
    human_figure_level VARCHAR(255),
    emotional_indicators TEXT,
    bender_level VARCHAR(255),
    psycho_observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Removed Foreign Key for simplicity/speed as requested/implied
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

console.log('Creating table evaluations_2_to_3 (No FK)...');

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Table created successfully or already exists.');
    process.exit(0);
});
