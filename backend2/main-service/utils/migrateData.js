/**
 * migrateData.js
 * 
 * This script migrates market price data from MongoDB to MySQL
 * Run this if you have existing data you want to transfer
 */

import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`.cyan.underline.bold);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`.red.bold);
    return false;
  }
}

// Connect to MySQL
async function getPoolConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'agriwebdb',
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log(`MySQL Connected`.cyan.underline.bold);
    connection.release();
    return pool;
  } catch (error) {
    console.error(`MySQL Connection Error: ${error.message}`.red.bold);
    return null;
  }
}

// MongoDB Market Price Schema (same as original)
const marketPriceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required (e.g., 40kg, Quintal)'],
      default: '40kg',
    },
    source: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongoMarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

// Migration function
async function migrateMarketPrices() {
  // Connect to both databases
  const mongoConnected = await connectMongoDB();
  const pool = await getPoolConnection();
  
  if (!mongoConnected || !pool) {
    console.error('Could not connect to both databases. Migration aborted.'.red.bold);
    process.exit(1);
  }
  
  try {
    // Get all market prices from MongoDB
    console.log('Fetching market prices from MongoDB...'.yellow);
    const marketPrices = await MongoMarketPrice.find({});
    console.log(`Found ${marketPrices.length} market price entries in MongoDB`.green);
    
    if (marketPrices.length === 0) {
      console.log('No data to migrate. Exiting.'.yellow);
      process.exit(0);
    }
    
    // Prepare for batch insertion
    console.log('Migrating data to MySQL...'.yellow);
    
    // Insert data into MySQL
    for (const price of marketPrices) {
      await pool.execute(
        'INSERT INTO market_prices (farmer_id, crop, price, unit, source, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          price.farmer.toString(), // Convert MongoDB ObjectId to string
          price.crop,
          price.price,
          price.unit,
          price.source || null,
          price.notes || null,
          price.createdAt,
          price.updatedAt
        ]
      );
    }
    
    console.log(`Successfully migrated ${marketPrices.length} market price entries to MySQL`.green.bold);
  } catch (error) {
    console.error(`Migration error: ${error.message}`.red.bold);
  } finally {
    // Close connections
    await mongoose.disconnect();
    await pool.end();
    console.log('Database connections closed'.yellow);
  }
}

// Run migration
migrateMarketPrices();
