import express from 'express';
import { sendMessageToUser } from '../../controllers/admin/communicationController.js';
import { protect, admin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, admin); // All routes here require admin privileges

router.route('/send-message').post(sendMessageToUser);

export default router;