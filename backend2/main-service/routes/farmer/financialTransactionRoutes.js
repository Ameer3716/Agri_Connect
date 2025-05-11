import express from 'express';
import {
  getTransactions, createTransaction, deleteTransaction, getFinancialSummary,
} from '../../controllers/farmer/financialTransactionController.js';
import { protect, farmer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, farmer);

router.route('/transactions') // Path for list/create
  .get(getTransactions)
  .post(createTransaction);

router.route('/transactions/:id') // Path for specific transaction
  .delete(deleteTransaction);

router.route('/summary') // Path for summary
  .get(getFinancialSummary);

export default router;