import express from 'express';
import {
  getMyListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
} from '../../controllers/farmer/productListingController.js';
import { protect, farmer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, farmer); // All routes are protected and for farmers

router.route('/')
  .get(getMyListings)
  .post(createListing);

router.route('/:id')
  .get(getListingById) // To fetch specific listing for edit form
  .put(updateListing)
  .delete(deleteListing);

export default router;