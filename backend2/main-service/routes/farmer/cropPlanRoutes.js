import express from 'express';
import {
  getCropPlans, getCropPlanById, createCropPlan,
  updateCropPlan, deleteCropPlan,
} from '../../controllers/farmer/cropPlanController.js';
import { protect, farmer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, farmer);

router.route('/')
  .get(getCropPlans)
  .post(createCropPlan);

router.route('/:id') // Standard parameter
  .get(getCropPlanById)
  .put(updateCropPlan)
  .delete(deleteCropPlan);

export default router;