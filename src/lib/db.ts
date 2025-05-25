
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
-- Users Table DDL
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(30) NULL,
    age INT UNSIGNED NULL,
    style_preferences JSON NULL,
    skin_tone VARCHAR(50) NULL,
    weight INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
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

-- Shared Outfits Table DDL (Updated for mood and weather)
CREATE TABLE IF NOT EXISTS shared_outfits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    user_gender VARCHAR(30) NULL,
    user_age INT UNSIGNED NULL,
    mood_keywords TEXT NULL,                    -- 心情关键词 (例如 "开心, 活力")
    weather_information VARCHAR(255) NULL,      -- 天气信息 (例如 "晴朗温暖")
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

// To update an existing shared_outfits table (if it exists without mood/weather):
/*
ALTER TABLE shared_outfits
ADD COLUMN mood_keywords TEXT NULL COMMENT '分享时的心情关键词，逗号分隔' AFTER user_age,
ADD COLUMN weather_information VARCHAR(255) NULL COMMENT '分享时的天气信息' AFTER mood_keywords;
*/
