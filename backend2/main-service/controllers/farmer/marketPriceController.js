import asyncHandler from 'express-async-handler';
import MarketPrice from '../../models/farmer/MarketPrice.js';

// @desc    Get all market prices for the logged-in farmer
// @route   GET /api/farmer/marketprices
// @access  Private (Farmer only)
const getMarketPrices = asyncHandler(async (req, res) => {
  try {
    // Use the new findByFarmerId method instead of Mongoose's find
    const prices = await MarketPrice.findByFarmerId(req.user._id);
    res.json(prices);
  } catch (error) {
    console.error('Error in getMarketPrices:', error);
    res.status(500);
    throw new Error(`Failed to fetch market prices: ${error.message}`);
  }
});

// @desc    Create a new market price entry
// @route   POST /api/farmer/marketprices
// @access  Private (Farmer only)
const createMarketPrice = asyncHandler(async (req, res) => {
  const { crop, price, unit, source, notes } = req.body;

  if (!crop || price === undefined || !unit) {
    res.status(400);
    throw new Error('Crop name, price, and unit are required');
  }
  if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    res.status(400);
    throw new Error('Price must be a valid positive number');
  }

  // Using the new MarketPrice.create method
  const priceData = {
    farmer: req.user._id,
    crop,
    price: parseFloat(price),
    unit,
    source,
    notes,
  };

  const createdMarketPrice = await MarketPrice.create(priceData);
  res.status(201).json(createdMarketPrice);
});

// @desc    Update an existing market price entry
// @route   PUT /api/farmer/marketprices/:id
// @access  Private (Farmer only)
const updateMarketPrice = asyncHandler(async (req, res) => {
  const { crop, price, unit, source, notes } = req.body;
  const id = req.params.id;

  const marketPrice = await MarketPrice.findById(id);

  if (marketPrice) {
    if (marketPrice.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this price entry');
    }

    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
        res.status(400);
        throw new Error('Price must be a valid positive number');
    }

    // Prepare the updated market price object
    const updatedPrice = {
      _id: id,
      farmer: marketPrice.farmer,
      crop: crop || marketPrice.crop,
      price: price !== undefined ? parseFloat(price) : marketPrice.price,
      unit: unit || marketPrice.unit,
      source: source !== undefined ? source : marketPrice.source,
      notes: notes !== undefined ? notes : marketPrice.notes
    };

    // Use the new save method
    const updatedMarketPrice = await MarketPrice.save(updatedPrice);
    res.json(updatedMarketPrice);
  } else {
    res.status(404);
    throw new Error('Market price entry not found');
  }
});

// @desc    Delete a market price entry
// @route   DELETE /api/farmer/marketprices/:id
// @access  Private (Farmer only)
const deleteMarketPrice = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const marketPrice = await MarketPrice.findById(id);

  if (marketPrice) {
    if (marketPrice.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this price entry');
    }
    // Use the new deleteOne method with the criteria object
    await MarketPrice.deleteOne({ _id: id });
    res.json({ message: 'Market price entry removed' });
  } else {
    res.status(404);
    throw new Error('Market price entry not found');
  }
});

export {
  getMarketPrices,
  createMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
};