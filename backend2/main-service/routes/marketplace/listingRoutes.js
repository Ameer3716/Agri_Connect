import express from 'express';
import {
  getAllActiveListings,
  getPublicListingById,
} from '../../controllers/marketplace/listingController.js'; // Correct path to controller

const router = express.Router();

// Public routes for browsing marketplace listings
router.route('/').get(getAllActiveListings);       // Will be mounted at /api/marketplace/listings
router.route('/:id').get(getPublicListingById);    // Will be mounted at /api/marketplace/listings/:id

export default router;