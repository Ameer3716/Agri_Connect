import asyncHandler from 'express-async-handler';
import ProductListing from '../../models/farmer/ProductListing.js'; // Path to shared model

// @desc    Fetch all active product listings for the marketplace
// @route   GET /api/marketplace/listings
// @access  Public
const getAllActiveListings = asyncHandler(async (req, res) => {
  const listings = await ProductListing.find({ status: 'active' })
    .populate('farmer', 'name location') // Populate farmer details
    .sort({ createdAt: -1 });
  res.json(listings);
});

// @desc    Fetch a single product listing by ID (for public view)
// @route   GET /api/marketplace/listings/:id
// @access  Public
const getPublicListingById = asyncHandler(async (req, res) => {
    const listing = await ProductListing.findOne({ _id: req.params.id, status: 'active' })
        .populate('farmer', 'name email location'); // Populate more farmer details

    if (listing) {
        res.json(listing);
    } else {
        res.status(404);
        throw new Error('Active product listing not found');
    }
});

export {
  getAllActiveListings,
  getPublicListingById,
};