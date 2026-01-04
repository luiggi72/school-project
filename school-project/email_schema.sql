ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE AFTER username;
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL; -- Default email for existing users
