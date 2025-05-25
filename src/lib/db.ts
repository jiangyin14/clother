
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// Example DDL for tables (for reference, execute this in your MySQL client)
/*
-- Users Table DDL (Updated for skin_tone, weight, and height)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(30) NULL,
    age INT UNSIGNED NULL,
    style_preferences JSON NULL,
    skin_tone VARCHAR(50) NULL,                 -- 肤色
    weight INT UNSIGNED NULL,                   -- 体重 (kg)
    height INT UNSIGNED NULL,                   -- 身高 (cm)
    oobe_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clothing Items Table DDL
CREATE TABLE IF NOT EXISTS clothing_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url LONGTEXT,
    attributes JSON,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shared Outfits Table DDL (New table for Showcase)
CREATE TABLE IF NOT EXISTS shared_outfits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,             -- Denormalized for easy display
    user_gender VARCHAR(30) NULL,               -- Denormalized
    user_age INT UNSIGNED NULL,                 -- Denormalized
    outfit_description TEXT NOT NULL,
    image_data_uri LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional: Indexes
CREATE INDEX IF NOT EXISTS idx_user_id_clothing ON clothing_items (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_outfits_created_at ON shared_outfits (created_at);
CREATE INDEX IF NOT EXISTS idx_shared_outfits_user_id ON shared_outfits (user_id);

*/

// To update an existing users table, you might run:
/*
ALTER TABLE users
ADD COLUMN gender VARCHAR(30) NULL AFTER password_hash,
ADD COLUMN age INT UNSIGNED NULL AFTER gender,
ADD COLUMN style_preferences JSON NULL AFTER age,
ADD COLUMN skin_tone VARCHAR(50) NULL AFTER style_preferences,
ADD COLUMN weight INT UNSIGNED NULL AFTER skin_tone,
ADD COLUMN height INT UNSIGNED NULL AFTER weight,
ADD COLUMN oobe_completed BOOLEAN DEFAULT FALSE AFTER height;
*/
