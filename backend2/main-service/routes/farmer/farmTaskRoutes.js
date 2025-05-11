import express from 'express';
import {
  getFarmTasks, getFarmTaskById, createFarmTask,
  updateFarmTask, deleteFarmTask,
} from '../../controllers/farmer/farmTaskController.js';
import { protect, farmer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, farmer);

router.route('/')
  .get(getFarmTasks)
  .post(createFarmTask);

router.route('/:id') // Standard parameter
  .get(getFarmTaskById)
  .put(updateFarmTask)
  .delete(deleteFarmTask);

export default router;