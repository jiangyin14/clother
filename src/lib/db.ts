
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

// Test the connection (optional, good for startup)
// async function testConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log('Successfully connected to MySQL database.');
//     connection.release();
//   } catch (error) {
//     console.error('Error connecting to MySQL database:', error);
//   }
// }
// testConnection();

export default pool;

// Example DDL for tables (for reference, execute this in your MySQL client)
/*
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clothing_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url LONGTEXT, -- Storing Data URI, consider file storage for production
    attributes JSON,    -- Storing attributes as a JSON array string
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional: Table for explore recommendations
CREATE TABLE IF NOT EXISTS explore_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    selected_items_json TEXT, -- JSON string of selected item names
    mood_keywords VARCHAR(255),
    weather_information VARCHAR(255),
    recommendation_description TEXT,
    image_prompt_details TEXT,
    generated_image_data_uri LONGTEXT, -- Storing Data URI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

*/
