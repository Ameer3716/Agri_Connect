import mongoose from 'mongoose';

const cropPlanSchema = new mongoose.Schema(
  {
    farmer: { // Link to the User (Farmer) who owns this plan
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Refers to the 'User' model
    },
    cropName: {
      type: String,
      required: [true, 'Please provide the crop name and variety'],
      trim: true,
    },
    fieldName: {
      type: String,
      required: [true, 'Please provide the field name or ID'],
      trim: true,
    },
    area: {
      type: String, // e.g., "10 Acres", "5 Hectares"
      required: [true, 'Please specify the area'],
    },
    plantingDate: {
      type: Date,
    },
    expectedHarvestDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['Planned', 'Planted', 'Growing', 'Flowering', 'Harvest Ready', 'Harvested', 'Cancelled'],
      default: 'Planned',
    },
    notes: {
      type: String,
      trim: true,
    },
    // You can add more fields like:
    // expectedYield: String,
    // actualYield: String,
    // soilType: String,
    // irrigationMethod: String,
    // fertilizerUsed: [{ type: String }],
    // pesticideUsed: [{ type: String }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const CropPlan = mongoose.model('CropPlan', cropPlanSchema);

export default CropPlan;