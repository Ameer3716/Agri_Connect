import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import productListingRoutes from '../../routes/farmer/productListingRoutes.js';
import ProductListing from '../../models/farmer/ProductListing.js';

const mockObjectId = () => new mongoose.Types.ObjectId().toHexString();
const mockFarmerId = mockObjectId();

jest.mock('../../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { _id: mockFarmerId, role: 'farmer' };
    next();
  }),
  farmer: jest.fn((req, res, next) => {
    if (req.user && req.user.role === 'farmer') return next();
    return res.status(401).json({ message: 'Not authorized' });
  }),
}));

const mockListingSave = jest.fn();
const mockListingDeleteOne = jest.fn();
const mockListingFind = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
const mockListingFindById = jest.fn();

jest.mock('../../models/farmer/ProductListing.js', () => {
  return jest.fn().mockImplementation(data => ({
    ...data,
    _id: data._id || mockObjectId(),
    farmer: data.farmer || mockFarmerId,
    save: mockListingSave,
  }));
});

ProductListing.find = mockListingFind;
ProductListing.findById = mockListingFindById;
ProductListing.deleteOne = mockListingDeleteOne;

const app = express();
app.use(express.json());
app.use('/api/farmer/listings', productListingRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

describe('Product Listing API Routes - Happy Paths', () => {
  let sampleListing, sampleListingData;

  beforeEach(() => {
    mockListingSave.mockReset();
    mockListingDeleteOne.mockReset();
    mockListingFind.mockReset().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockListingFindById.mockReset();

    sampleListingData = {
      productName: 'Organic Carrots', category: 'Vegetables', quantity: 100,
      unit: 'kg', pricePerUnit: 1.5, description: 'Fresh carrots.',
    };
    sampleListing = { _id: mockObjectId(), farmer: mockFarmerId, ...sampleListingData };

    mockListingFind.mockReturnValue({ sort: jest.fn().mockResolvedValue([sampleListing]) });
    mockListingSave.mockResolvedValue(sampleListing);
    mockListingFindById.mockImplementation(id => {
      if (id === sampleListing._id) {
        return Promise.resolve({
          ...sampleListing,
          farmer: { toString: () => mockFarmerId },
          save: mockListingSave.mockResolvedValue(sampleListing)
        });
      }
      return Promise.resolve(null);
    });
    mockListingDeleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  it('GET /api/farmer/listings - should get all listings for farmer', async () => {
    const response = await request(app).get('/api/farmer/listings');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleListing]);
  });

  it('POST /api/farmer/listings - should create a new product listing', async () => {
    const response = await request(app).post('/api/farmer/listings').send(sampleListingData);
    expect(response.status).toBe(201);
    expect(response.body.productName).toBe(sampleListingData.productName);
  });

  it('GET /api/farmer/listings/:id - should get a single listing by ID if owned by farmer', async () => {
    const response = await request(app).get(`/api/farmer/listings/${sampleListing._id}`);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(sampleListing._id);
  });

  it('PUT /api/farmer/listings/:id - should update an existing product listing', async () => {
    const updates = { description: 'Extra fresh carrots' };
    mockListingSave.mockResolvedValueOnce({ ...sampleListing, ...updates });
    const response = await request(app).put(`/api/farmer/listings/${sampleListing._id}`).send(updates);
    expect(response.status).toBe(200);
    expect(response.body.description).toBe(updates.description);
  });

  it('DELETE /api/farmer/listings/:id - should delete a product listing', async () => {
    const response = await request(app).delete(`/api/farmer/listings/${sampleListing._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product listing removed');
  });
});