/**
 * MarketPrice.js - MySQL implementation for Market Price management
 * This replaces the MongoDB implementation with MySQL using mysql2/promise
 */

// Use the globally available pool from dbSql.js
const MarketPrice = {  /**
   * Find all market prices for a specific farmer
   * @param {string|object} farmerId - The ID of the farmer (can be MongoDB ObjectId or string)
   * @returns {Promise<Array>} - Array of market price entries
   */
  async findByFarmerId(farmerId) {
    // Convert MongoDB ObjectId to string if needed
    const farmerIdStr = farmerId.toString();
    
    const [rows] = await global.pool.execute(
      'SELECT * FROM market_prices WHERE farmer_id = ? ORDER BY updatedAt DESC',
      [farmerIdStr]
    );
    
    // Transform IDs to match MongoDB style expected by frontend
    return rows.map(row => ({
      _id: row.id.toString(),  // Convert to string to match MongoDB _id format
      farmer: row.farmer_id.toString(),
      crop: row.crop,
      price: row.price,
      unit: row.unit,
      source: row.source || '',
      notes: row.notes || '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  },
  /**
   * Find a market price entry by ID
   * @param {string|number} id - The ID of the market price entry
   * @returns {Promise<Object|null>} - The market price entry or null
   */
  async findById(id) {
    // Convert to string if it's a MongoDB ObjectId or any other object
    const idStr = id.toString();
    
    const [rows] = await global.pool.execute(
      'SELECT * FROM market_prices WHERE id = ?',
      [idStr]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      _id: row.id.toString(),
      farmer: row.farmer_id.toString(),
      crop: row.crop,
      price: row.price,
      unit: row.unit,
      source: row.source || '',
      notes: row.notes || '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  },
  /**
   * Create a new market price entry
   * @param {Object} priceData - The market price data
   * @returns {Promise<Object>} - The created market price entry
   */
  async create(priceData) {
    const { farmer, crop, price, unit, source, notes } = priceData;
    
    // Convert MongoDB ObjectId to string if needed
    const farmerIdStr = farmer.toString();
    
    const [result] = await global.pool.execute(
      'INSERT INTO market_prices (farmer_id, crop, price, unit, source, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [farmerIdStr, crop, price, unit, source || null, notes || null]
    );
    
    // Get the newly created record
    return this.findById(result.insertId);
  },
  /**
   * Update a market price entry
   * @param {Object} marketPrice - The market price object with changes
   * @returns {Promise<Object>} - The updated market price entry
   */
  async save(marketPrice) {
    const { _id, farmer, crop, price, unit, source, notes } = marketPrice;
    
    // Convert to strings if they're MongoDB ObjectIds or other objects
    const idStr = _id.toString();
    const farmerIdStr = farmer.toString();
    
    await global.pool.execute(
      'UPDATE market_prices SET crop = ?, price = ?, unit = ?, source = ?, notes = ? WHERE id = ? AND farmer_id = ?',
      [crop, price, unit, source || null, notes || null, idStr, farmerIdStr]
    );
    
    return this.findById(_id);
  },
  /**
   * Delete a market price entry by ID
   * @param {Object} criteria - Object containing conditions to match document for deletion
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteOne(criteria) {
    // Convert to string if it's a MongoDB ObjectId or any other object
    const idStr = criteria._id.toString();
    
    await global.pool.execute(
      'DELETE FROM market_prices WHERE id = ?',
      [idStr]
    );
    
    return { acknowledged: true, deletedCount: 1 };
  }
};

export default MarketPrice;