import express from 'express';
import {
  getMarketPrices, createMarketPrice, updateMarketPrice, deleteMarketPrice,
} from '../../controllers/farmer/marketPriceController.js';
import { protect, farmer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, farmer);

router.route('/')
  .get(getMarketPrices)
  .post(createMarketPrice);

router.route('/:id') // Standard parameter
  .put(updateMarketPrice)
  .delete(deleteMarketPrice);

export default router;