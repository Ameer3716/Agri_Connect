import express from 'express';
import {
  getAllListingsForAdmin,
  updateListingByAdmin,
  removeListingByAdmin, // This is for changing status to 'Removed'
  banFarmer,
  permanentlyDeleteListingByAdmin, // <<< IMPORTED
} from '../../controllers/admin/marketplaceAdminController.js';
import { protect, admin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, admin); // All routes here require admin privileges

// Get all listings for admin view
router.route('/listings').get(getAllListingsForAdmin);

// Routes for a specific listing by ID
router.route('/listings/:id')
  .put(updateListingByAdmin)   // For general edits and status changes (e.g., approve)
  .delete(removeListingByAdmin); // This is a "soft delete" (sets status to 'Removed')

// Route for PERMANENTLY deleting a listing
router.route('/listings/:id/permanent-delete') // <<< ADDED ROUTE
  .delete(permanentlyDeleteListingByAdmin);

// Route for banning a farmer
// Consider if /api/admin/users/:farmerId/ban would be a more appropriate top-level admin route structure for user actions.
// For now, keeping it within marketplace context as requested.
router.route('/users/:farmerId/ban').put(banFarmer);


export default router;