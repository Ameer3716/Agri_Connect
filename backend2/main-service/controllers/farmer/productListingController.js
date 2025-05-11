import asyncHandler from 'express-async-handler';
import ProductListing from '../../models/farmer/ProductListing.js';

// @desc    Get all product listings for the logged-in farmer
// @route   GET /api/farmer/listings
// @access  Private (Farmer only)
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await ProductListing.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json(listings);
});

// @desc    Create a new product listing
// @route   POST /api/farmer/listings
// @access  Private (Farmer only)
const createListing = asyncHandler(async (req, res) => {
  const {
    productName, category, quantity, unit, pricePerUnit, description, imageUrl, location, status
  } = req.body;

  if (!productName || !category || quantity === undefined || !unit || pricePerUnit === undefined || !description) {
    res.status(400);
    throw new Error('Please provide all required fields: productName, category, quantity, unit, pricePerUnit, description');
  }
  if (isNaN(parseFloat(quantity)) || parseFloat(quantity) < 0) {
    res.status(400); throw new Error('Quantity must be a valid non-negative number');
  }
  if (isNaN(parseFloat(pricePerUnit)) || parseFloat(pricePerUnit) < 0) {
    res.status(400); throw new Error('Price must be a valid non-negative number');
  }

  const listing = new ProductListing({
    farmer: req.user._id,
    productName,
    category,
    quantity: parseFloat(quantity),
    unit,
    pricePerUnit: parseFloat(pricePerUnit),
    description,
    imageUrl: imageUrl || `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(productName)}`, // Default placeholder
    location,
    status: status || 'active',
  });

  const createdListing = await listing.save();
  res.status(201).json(createdListing);
});

// @desc    Get a single listing by ID (for editing by farmer)
// @route   GET /api/farmer/listings/:id
// @access  Private (Farmer only)
const getListingById = asyncHandler(async (req, res) => {
    const listing = await ProductListing.findById(req.params.id);
    if (listing) {
        if (listing.farmer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to access this listing');
        }
        res.json(listing);
    } else {
        res.status(404);
        throw new Error('Listing not found');
    }
});


// @desc    Update an existing product listing
// @route   PUT /api/farmer/listings/:id
// @access  Private (Farmer only)
const updateListing = asyncHandler(async (req, res) => {
  const {
    productName, category, quantity, unit, pricePerUnit, description, imageUrl, location, status
  } = req.body;

  const listing = await ProductListing.findById(req.params.id);

  if (listing) {
    if (listing.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this listing');
    }

    if (quantity !== undefined && (isNaN(parseFloat(quantity)) || parseFloat(quantity) < 0)) {
      res.status(400); throw new Error('Quantity must be a valid non-negative number');
    }
    if (pricePerUnit !== undefined && (isNaN(parseFloat(pricePerUnit)) || parseFloat(pricePerUnit) < 0)) {
      res.status(400); throw new Error('Price must be a valid non-negative number');
    }

    listing.productName = productName || listing.productName;
    listing.category = category || listing.category;
    listing.quantity = quantity !== undefined ? parseFloat(quantity) : listing.quantity;
    listing.unit = unit || listing.unit;
    listing.pricePerUnit = pricePerUnit !== undefined ? parseFloat(pricePerUnit) : listing.pricePerUnit;
    listing.description = description || listing.description;
    listing.imageUrl = imageUrl !== undefined ? imageUrl : listing.imageUrl; // Allow empty string to clear
    listing.location = location !== undefined ? location : listing.location;
    listing.status = status || listing.status;

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Delete a product listing
// @route   DELETE /api/farmer/listings/:id
// @access  Private (Farmer only)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await ProductListing.findById(req.params.id);

  if (listing) {
    if (listing.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this listing');
    }
    await ProductListing.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product listing removed' });
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

export {
  getMyListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
};