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
