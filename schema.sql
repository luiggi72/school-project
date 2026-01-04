CREATE DATABASE IF NOT EXISTS school_db;
USE school_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- In a real app, this should be hashed
    role VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    profile VARCHAR(100),
    linked_family_id VARCHAR(50), -- Link to students parents
    push_token VARCHAR(255) -- For mobile notifications
);

CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50), -- To modify color (e.g. 'LEVEL:PREESCOLAR', 'URGENT', 'GENERAL')
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster fetching by user and date
CREATE INDEX idx_user_notifications_user_date ON user_notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lastnameP VARCHAR(100) NOT NULL,
    lastnameM VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    subgrade VARCHAR(50),
    group_name VARCHAR(50),
    unique_id VARCHAR(12) UNIQUE,
    birthdate DATE,
    curp VARCHAR(18),
    gender CHAR(1)
);

CREATE TABLE IF NOT EXISTS student_parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    type ENUM('MOTHER', 'FATHER', 'TUTOR') NOT NULL,
    name VARCHAR(100),
    lastnameP VARCHAR(100),
    lastnameM VARCHAR(100),
    birthdate DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    street VARCHAR(100),
    exterior_number VARCHAR(20),
    neighborhood VARCHAR(100),
    zip_code VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    UNIQUE KEY unique_parent (student_id, type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS school_info (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(50),
    director VARCHAR(100)
);

-- Insert default admin user if not exists
INSERT IGNORE INTO users (username, email, password, role, profile) VALUES ('admin', 'admin@example.com', 'admin', 'Administrador', '');

-- Insert default school info if not exists
INSERT IGNORE INTO school_info (id, name, address, phone, director) VALUES (1, 'Nombre de la Escuela', 'Dirección de la Escuela', 'Teléfono', 'Director');

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    concept VARCHAR(255),
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_date DATETIME,
    codi_transaction_id VARCHAR(100),
    codi_status ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'FAILED'),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
