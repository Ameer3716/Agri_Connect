import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import marketPriceRoutes from '../../routes/farmer/marketPriceRoutes.js';
import MarketPrice from '../../models/farmer/MarketPrice.js';

const mockObjectId = () => new mongoose.Types.ObjectId().toHexString();
const mockFarmerId = mockObjectId();
const mockPriceId = mockObjectId();

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

jest.mock('../../models/farmer/MarketPrice.js', () => ({
  findByFarmerId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  deleteOne: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/farmer/marketprices', marketPriceRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

describe('Market Price API Routes (MySQL) - Happy Paths', () => {
  let sampleMarketPrice, sampleMarketPriceData;

  beforeEach(() => {
    MarketPrice.findByFarmerId.mockReset();
    MarketPrice.findById.mockReset();
    MarketPrice.create.mockReset();
    MarketPrice.save.mockReset();
    MarketPrice.deleteOne.mockReset();

    sampleMarketPriceData = { crop: 'Wheat', price: 20.5, unit: 'kg' };
    sampleMarketPrice = { _id: mockPriceId, farmer: mockFarmerId.toString(), ...sampleMarketPriceData };

    MarketPrice.findByFarmerId.mockResolvedValue([sampleMarketPrice]);
    MarketPrice.findById.mockImplementation(id =>
      id === sampleMarketPrice._id ? Promise.resolve(sampleMarketPrice) : Promise.resolve(null)
    );
    MarketPrice.create.mockResolvedValue(sampleMarketPrice);
    MarketPrice.save.mockImplementation(updatedData => Promise.resolve({ ...sampleMarketPrice, ...updatedData }));
    MarketPrice.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  it('GET /api/farmer/marketprices - should get all market prices for farmer', async () => {
    const response = await request(app).get('/api/farmer/marketprices');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleMarketPrice]);
  });

  it('POST /api/farmer/marketprices - should create a new market price entry', async () => {
    const response = await request(app).post('/api/farmer/marketprices').send(sampleMarketPriceData);
    expect(response.status).toBe(201);
    expect(response.body.crop).toBe(sampleMarketPriceData.crop);
  });

  it('PUT /api/farmer/marketprices/:id - should update an existing market price entry', async () => {
    const updates = { price: 22.0 };
    const response = await request(app).put(`/api/farmer/marketprices/${sampleMarketPrice._id}`).send(updates);
    expect(response.status).toBe(200);
    expect(response.body.price).toBe(updates.price);
  });

  it('DELETE /api/farmer/marketprices/:id - should delete a market price entry', async () => {
    const response = await request(app).delete(`/api/farmer/marketprices/${sampleMarketPrice._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Market price entry removed');
  });
});