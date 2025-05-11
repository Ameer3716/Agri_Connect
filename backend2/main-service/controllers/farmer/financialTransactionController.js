import asyncHandler from 'express-async-handler';
import FinancialTransaction from '../../models/farmer/FinancialTransaction.js';
import mongoose from 'mongoose';

// @desc    Get all financial transactions for the logged-in farmer
// @route   GET /api/farmer/financials/transactions
// @access  Private (Farmer only)
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await FinancialTransaction.find({ farmer: req.user._id }).sort({ date: -1, createdAt: -1 });
  res.json(transactions);
});

// @desc    Create a new financial transaction
// @route   POST /api/farmer/financials/transactions
// @access  Private (Farmer only)
const createTransaction = asyncHandler(async (req, res) => {
  const { date, description, type, category, amount } = req.body;

  if (!date || !description || !type || amount === undefined) {
    res.status(400);
    throw new Error('Date, description, type, and amount are required');
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be a valid positive number');
  }

  const transaction = new FinancialTransaction({
    farmer: req.user._id,
    date,
    description,
    type,
    category: category || (type === 'Income' ? 'Sales' : 'Miscellaneous'), // Default category
    amount: parseFloat(amount),
  });

  const createdTransaction = await transaction.save();
  res.status(201).json(createdTransaction);
});

// @desc    Delete a financial transaction
// @route   DELETE /api/farmer/financials/transactions/:id
// @access  Private (Farmer only)
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await FinancialTransaction.findById(req.params.id);

  if (transaction) {
    if (transaction.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this transaction');
    }
    await FinancialTransaction.deleteOne({ _id: req.params.id });
    res.json({ message: 'Transaction removed' });
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

// @desc    Get financial summary for the logged-in farmer
// @route   GET /api/farmer/financials/summary
// @access  Private (Farmer only)
const getFinancialSummary = asyncHandler(async (req, res) => {
  const farmerId = new mongoose.Types.ObjectId(req.user._id);

  const summary = await FinancialTransaction.aggregate([
    { $match: { farmer: farmerId } },
    {
      $group: {
        _id: '$type', // Group by type (Income/Expense)
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  summary.forEach(item => {
    if (item._id === 'Income') {
      totalIncome = item.totalAmount;
    } else if (item._id === 'Expense') {
      totalExpenses = item.totalAmount;
    }
  });

  const netProfit = totalIncome - totalExpenses;

  // Get expense breakdown by category for Pie Chart
  const expenseBreakdown = await FinancialTransaction.aggregate([
    { $match: { farmer: farmerId, type: 'Expense' } },
    { $group: {
        _id: '$category', // Group expenses by category
        value: { $sum: '$amount' } // Sum amounts for each category
      }
    },
    { $project: {
        name: '$_id', // Rename _id to name for chart compatibility
        value: 1,
        _id: 0 // Exclude original _id
      }
    },
    { $sort: { value: -1 } } // Sort by highest expense
  ]);


  res.json({
    totalIncome,
    totalExpenses,
    netProfit,
    expenseBreakdown, // This will be an array of { name: 'Category', value: amount }
    lastUpdated: new Date().toISOString() // Or fetch the latest transaction's updatedAt
  });
});


export {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getFinancialSummary,
};