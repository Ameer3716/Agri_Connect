# MarketPrice MySQL Implementation

This project has been updated to use MySQL for the MarketPrice model, replacing the previous MongoDB implementation.

## Setup Instructions

### Prerequisites
- Node.js and npm
- XAMPP (for MySQL server)
- Make sure your MySQL server is running through XAMPP

### Database Setup
1. Start your XAMPP control panel and ensure MySQL service is running
2. The database structure will be created automatically when you run the initialization script

### Installation

1. Install the required dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend folder based on the provided `.env.example`

3. Initialize the database:
```bash
npm run init-db
```

### Running the Application

1. Start the backend server:
```bash
npm start
```

2. Start the frontend development server (in a separate terminal):
```bash
cd agri-connect-frontend
npm install
npm run dev
```

## Implementation Details

- The MarketPrice model has been converted from MongoDB to MySQL
- The database schema has been defined according to the SQL table structure
- The API endpoints remain the same, ensuring compatibility with the frontend
- Both database connections (MongoDB and MySQL) are active to support the mixed database environment

## Table Structure

The MarketPrice model uses the following table structure:

```sql
CREATE TABLE market_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
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
```

## Notes for Developers

- The interface for interacting with the MarketPrice model remains the same, with methods like `findById`, `create`, `save`, and `deleteOne`
- MongoDB's ObjectId is handled by converting to/from string format to maintain compatibility with frontend expectations
- The MarketPrice model format returned from MySQL has been transformed to match the MongoDB structure
