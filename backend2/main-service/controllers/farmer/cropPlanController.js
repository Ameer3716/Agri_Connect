import asyncHandler from 'express-async-handler';
import CropPlan from '../../models/farmer/CropPlan.js';
//  import User from '../../../auth-service/models/User.js'; // To verify farmer role if needed

// @desc    Get all crop plans for the logged-in farmer
// @route   GET /api/farmer/cropplans
// @access  Private (Farmer only)
const getCropPlans = asyncHandler(async (req, res) => {
  // req.user is attached by the 'protect' middleware
  const cropPlans = await CropPlan.find({ farmer: req.user._id }).sort({ createdAt: -1 }); // Sort by newest
  res.json(cropPlans);
});

// @desc    Get a single crop plan by ID
// @route   GET /api/farmer/cropplans/:id
// @access  Private (Farmer only)
const getCropPlanById = asyncHandler(async (req, res) => {
  const cropPlan = await CropPlan.findById(req.params.id);

  if (cropPlan) {
    // Ensure the plan belongs to the logged-in farmer
    if (cropPlan.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this crop plan');
    }
    res.json(cropPlan);
  } else {
    res.status(404);
    throw new Error('Crop plan not found');
  }
});

// @desc    Create a new crop plan
// @route   POST /api/farmer/cropplans
// @access  Private (Farmer only)
const createCropPlan = asyncHandler(async (req, res) => {
  const {
    cropName,
    fieldName,
    area,
    plantingDate,
    expectedHarvestDate,
    status,
    notes,
  } = req.body;

  if (!cropName || !fieldName || !area) {
    res.status(400);
    throw new Error('Crop name, field name, and area are required');
  }

  const cropPlan = new CropPlan({
    farmer: req.user._id, // Associate with the logged-in farmer
    cropName,
    fieldName,
    area,
    plantingDate: plantingDate || null,
    expectedHarvestDate: expectedHarvestDate || null,
    status: status || 'Planned',
    notes,
  });

  const createdCropPlan = await cropPlan.save();
  res.status(201).json(createdCropPlan);
});

// @desc    Update an existing crop plan
// @route   PUT /api/farmer/cropplans/:id
// @access  Private (Farmer only)
const updateCropPlan = asyncHandler(async (req, res) => {
  const {
    cropName,
    fieldName,
    area,
    plantingDate,
    expectedHarvestDate,
    status,
    notes,
  } = req.body;

  const cropPlan = await CropPlan.findById(req.params.id);

  if (cropPlan) {
    // Ensure the plan belongs to the logged-in farmer
    if (cropPlan.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this crop plan');
    }

    cropPlan.cropName = cropName || cropPlan.cropName;
    cropPlan.fieldName = fieldName || cropPlan.fieldName;
    cropPlan.area = area || cropPlan.area;
    cropPlan.plantingDate = plantingDate !== undefined ? plantingDate : cropPlan.plantingDate;
    cropPlan.expectedHarvestDate = expectedHarvestDate !== undefined ? expectedHarvestDate : cropPlan.expectedHarvestDate;
    cropPlan.status = status || cropPlan.status;
    cropPlan.notes = notes !== undefined ? notes : cropPlan.notes;

    const updatedCropPlan = await cropPlan.save();
    res.json(updatedCropPlan);
  } else {
    res.status(404);
    throw new Error('Crop plan not found');
  }
});

// @desc    Delete a crop plan
// @route   DELETE /api/farmer/cropplans/:id
// @access  Private (Farmer only)
const deleteCropPlan = asyncHandler(async (req, res) => {
  const cropPlan = await CropPlan.findById(req.params.id);

  if (cropPlan) {
    // Ensure the plan belongs to the logged-in farmer
    if (cropPlan.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this crop plan');
    }

    await CropPlan.deleteOne({ _id: req.params.id }); // Mongoose v6+
    // For older Mongoose: await cropPlan.remove();
    res.json({ message: 'Crop plan removed successfully' });
  } else {
    res.status(404);
    throw new Error('Crop plan not found');
  }
});

export {
  getCropPlans,
  getCropPlanById,
  createCropPlan,
  updateCropPlan,
  deleteCropPlan,
};