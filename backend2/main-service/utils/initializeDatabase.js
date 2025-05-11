/**
 * initializeDatabase.js
 * 
 * This script initializes the MySQL database tables if they don't exist.
 * It should be run during the setup of the application.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  multipleStatements: true // Enable multiple statements for initialization
};

// Database and tables creation SQL
const createDatabaseSQL = `
CREATE DATABASE IF NOT EXISTS agriwebdb;
USE agriwebdb;

-- Market Prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id VARCHAR(255) NOT NULL, -- Changed to VARCHAR to support MongoDB ObjectId strings
  crop VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT '40kg',
  source VARCHAR(255),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_farmer_crop (farmer_id, crop),
  INDEX idx_farmer_updated (farmer_id, updatedAt)
);
`;

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL server...'.yellow);
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating database and tables if they don\'t exist...'.yellow);
    await connection.query(createDatabaseSQL);
    
    console.log('Database initialization complete.'.green.bold);
    await connection.end();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`.red.bold);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
