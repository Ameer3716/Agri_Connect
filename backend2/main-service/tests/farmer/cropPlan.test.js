import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cropPlanRoutes from '../../routes/farmer/cropPlanRoutes.js';
import CropPlan from '../../models/farmer/CropPlan.js';

const mockObjectId = () => new mongoose.Types.ObjectId().toHexString();
const mockFarmerId = mockObjectId();

jest.mock('../../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { _id: mockFarmerId, role: 'farmer' };
    next();
  }),
  farmer: jest.fn((req, res, next) => {
    if (req.user && req.user.role === 'farmer') {
      return next();
    }
    return res.status(401).json({ message: 'Not authorized, farmer role required' });
  }),
}));

const mockCropPlanSave = jest.fn();
const mockCropPlanDeleteOne = jest.fn();
const mockCropPlanFind = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }); // Ensure sort is chainable
const mockCropPlanFindById = jest.fn();

jest.mock('../../models/farmer/CropPlan.js', () => {
  return jest.fn().mockImplementation(data => ({
    ...data,
    _id: data._id || mockObjectId(),
    farmer: data.farmer || mockFarmerId,
    save: mockCropPlanSave,
  }));
});

CropPlan.find = mockCropPlanFind;
CropPlan.findById = mockCropPlanFindById;
CropPlan.deleteOne = mockCropPlanDeleteOne;

const app = express();
app.use(express.json());
app.use('/api/farmer/cropplans', cropPlanRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

describe('Crop Plan API Routes - Happy Paths', () => {
  let sampleCropPlan;
  let sampleCropPlanData;

  beforeEach(() => {
    mockCropPlanSave.mockReset();
    mockCropPlanDeleteOne.mockReset();
    mockCropPlanFind.mockReset().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockCropPlanFindById.mockReset();

    sampleCropPlanData = {
      cropName: 'Tomato',
      fieldName: 'Field A1',
      area: '2 Acres',
      plantingDate: new Date('2024-01-15').toISOString(),
      expectedHarvestDate: new Date('2024-05-15').toISOString(),
      status: 'Planted',
      notes: 'Organic farming',
    };

    sampleCropPlan = {
      _id: mockObjectId(),
      farmer: mockFarmerId,
      ...sampleCropPlanData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCropPlanFind.mockReturnValue({ sort: jest.fn().mockResolvedValue([sampleCropPlan]) });
    mockCropPlanSave.mockResolvedValue({ ...sampleCropPlan, ...sampleCropPlanData });
    mockCropPlanFindById.mockImplementation(id => {
      if (id === sampleCropPlan._id) {
        return Promise.resolve({
          ...sampleCropPlan,
          farmer: { toString: () => mockFarmerId },
          save: mockCropPlanSave.mockResolvedValue({ ...sampleCropPlan, ...sampleCropPlanData })
        });
      }
      return Promise.resolve(null); // For other IDs, simulate not found
    });
    mockCropPlanDeleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  it('GET /api/farmer/cropplans - should get all crop plans for the logged-in farmer', async () => {
    const response = await request(app).get('/api/farmer/cropplans');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleCropPlan]);
    expect(mockCropPlanFind).toHaveBeenCalledWith({ farmer: mockFarmerId });
  });

  it('POST /api/farmer/cropplans - should create a new crop plan with valid data', async () => {
    const newPlanData = { ...sampleCropPlanData };
    mockCropPlanSave.mockResolvedValueOnce({ _id: mockObjectId(), farmer: mockFarmerId, ...newPlanData });

    const response = await request(app)
      .post('/api/farmer/cropplans')
      .send(newPlanData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.cropName).toBe(newPlanData.cropName);
  });

  it('GET /api/farmer/cropplans/:id - should get a single crop plan by ID if it belongs to the farmer', async () => {
    const response = await request(app).get(`/api/farmer/cropplans/${sampleCropPlan._id}`);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(sampleCropPlan._id);
  });

  it('PUT /api/farmer/cropplans/:id - should update an existing crop plan with valid data', async () => {
    const updates = { cropName: 'Updated Tomato', status: 'Harvested' };
    mockCropPlanSave.mockResolvedValueOnce({ ...sampleCropPlan, ...updates });

    const response = await request(app)
      .put(`/api/farmer/cropplans/${sampleCropPlan._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.cropName).toBe(updates.cropName);
  });

  it('DELETE /api/farmer/cropplans/:id - should delete a crop plan if it belongs to the farmer', async () => {
    const response = await request(app).delete(`/api/farmer/cropplans/${sampleCropPlan._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Crop plan removed successfully');
  });
});