import mongoose from 'mongoose';

const financialTransactionSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Income', 'Expense'],
    },
    category: {
      type: String,
      trim: true,
      // Consider predefined categories or allow free text
      // enum: ['Seeds', 'Fertilizers', 'Labor', 'Fuel', 'Repairs', 'Sales', 'Other Income', 'Other Expense']
      // If using enum, ensure frontend matches or provides these.
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    // Optional: notes, reference numbers, link to crop/task
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying and sorting
financialTransactionSchema.index({ farmer: 1, date: -1 }); // Sort by date descending by default
financialTransactionSchema.index({ farmer: 1, type: 1, category: 1 }); // For financial summaries

const FinancialTransaction = mongoose.model('FinancialTransaction', financialTransactionSchema);

export default FinancialTransaction;