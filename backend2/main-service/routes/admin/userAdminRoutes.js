// backend/routes/admin/userAdminRoutes.js
import express from 'express';
import { getAllUsersForAdmin } from '../../controllers/admin/userAdminController.js';
import { protect, admin } from '../../middlewares/authMiddleware.js'; // Ensure these middlewares are correctly implemented

const router = express.Router();

// Apply protect and admin middleware to all routes defined in this file
router.use(protect, admin);

// Define the route for getting all users
router.route('/all').get(getAllUsersForAdmin);

// Add more admin-specific user routes here if needed:
// router.route('/:userId').get(getUserByIdForAdmin);
// router.route('/:userId').put(updateUserByAdmin);
// router.route('/:userId/ban').put(banUserByAdmin); // If ban logic moves here

export default router;