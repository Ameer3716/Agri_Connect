import mongoose from 'mongoose';

const farmTaskSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    task: {
      type: String,
      required: [true, 'Please provide the task name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    due: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Pending',
    },
    assignedTo: {
      type: String,
      trim: true,
      default: 'Self',
    },
    notes: {
      type: String,
      trim: true,
    },
    // Optional: Link to a specific CropPlan
    // cropPlan: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'CropPlan',
    //   required: false
    // },
  },
  {
    timestamps: true,
  }
);

// Index for querying tasks by farmer and due date efficiently
farmTaskSchema.index({ farmer: 1, due: 1 });

const FarmTask = mongoose.model('FarmTask', farmTaskSchema);

export default FarmTask;