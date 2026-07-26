-- Create Database
CREATE DATABASE IF NOT EXISTS garments_db;
USE garments_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  menu_key VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Database Backups History Table
CREATE TABLE IF NOT EXISTS backup_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL,
  backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'Success',
  file_size VARCHAR(50)
);

-- Insert Default Admin User
INSERT INTO users (name, username, password, email, role) 
VALUES ('System Admin', 'admin', 'admin123', 'admin@bestwool.com', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Insert Mock Permissions for Admin
INSERT INTO permissions (user_id, menu_key, can_view)
VALUES 
(1, 'dashboard', TRUE),
(1, 'buyer', TRUE),
(1, 'style', TRUE),
(1, 'process', TRUE),
(1, 'piece_rate', TRUE),
(1, 'yarn_challan', TRUE),
(1, 'buyer_order_info', TRUE),
(1, 'production_entry', TRUE),
(1, 'production_show', TRUE),
(1, 'user', TRUE),
(1, 'user_permission', TRUE),
(1, 'database_backup', TRUE)
ON DUPLICATE KEY UPDATE id=id;
