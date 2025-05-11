import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import financialTransactionRoutes from '../../routes/farmer/financialTransactionRoutes.js';
import FinancialTransaction from '../../models/farmer/FinancialTransaction.js';

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

const mockTransactionSave = jest.fn();
const mockTransactionDeleteOne = jest.fn();
const mockTransactionFind = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
const mockTransactionFindById = jest.fn();
const mockTransactionAggregate = jest.fn();

jest.mock('../../models/farmer/FinancialTransaction.js', () => {
  return jest.fn().mockImplementation(data => ({
    ...data,
    _id: data._id || mockObjectId(),
    farmer: data.farmer || mockFarmerId,
    save: mockTransactionSave,
  }));
});

FinancialTransaction.find = mockTransactionFind;
FinancialTransaction.findById = mockTransactionFindById;
FinancialTransaction.deleteOne = mockTransactionDeleteOne;
FinancialTransaction.aggregate = mockTransactionAggregate;

const app = express();
app.use(express.json());
app.use('/api/farmer/financials', financialTransactionRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

describe('Financial Transaction API Routes - Happy Paths', () => {
  let sampleTransaction, sampleTransactionData;

  beforeEach(() => {
    mockTransactionSave.mockReset();
    mockTransactionDeleteOne.mockReset();
    mockTransactionFind.mockReset().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockTransactionFindById.mockReset();
    mockTransactionAggregate.mockReset();

    sampleTransactionData = {
      date: new Date().toISOString(),
      description: 'Sale of 10kg Tomatoes',
      type: 'Income',
      category: 'Sales',
      amount: 50.0,
    };
    sampleTransaction = { _id: mockObjectId(), farmer: mockFarmerId, ...sampleTransactionData };

    mockTransactionFind.mockReturnValue({ sort: jest.fn().mockResolvedValue([sampleTransaction]) });
    mockTransactionSave.mockResolvedValue(sampleTransaction);
    mockTransactionFindById.mockImplementation(id => {
      if (id === sampleTransaction._id) {
        return Promise.resolve({ ...sampleTransaction, farmer: { toString: () => mockFarmerId } });
      }
      return Promise.resolve(null);
    });
    mockTransactionDeleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    mockTransactionAggregate.mockResolvedValue([ // Simplified mock for summary
      { _id: 'Income', totalAmount: 1000 },
      { _id: 'Expense', totalAmount: 300 },
    ]);
  });

  it('GET /api/farmer/financials/transactions - should get all transactions', async () => {
    const response = await request(app).get('/api/farmer/financials/transactions');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleTransaction]);
  });

  it('POST /api/farmer/financials/transactions - should create a new transaction', async () => {
    const response = await request(app).post('/api/farmer/financials/transactions').send(sampleTransactionData);
    expect(response.status).toBe(201);
    expect(response.body.description).toBe(sampleTransactionData.description);
  });

  it('DELETE /api/farmer/financials/transactions/:id - should delete a transaction', async () => {
    const response = await request(app).delete(`/api/farmer/financials/transactions/${sampleTransaction._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Transaction removed');
  });

  it('GET /api/farmer/financials/summary - should get financial summary', async () => {
    // Adjust mock for the two aggregate calls in getFinancialSummary
    mockTransactionAggregate
      .mockResolvedValueOnce([ // For overall summary
        { _id: 'Income', totalAmount: 1000 },
        { _id: 'Expense', totalAmount: 300 },
      ])
      .mockResolvedValueOnce([ // For expense breakdown
        { name: 'Seeds', value: 150 },
        { name: 'Fertilizer', value: 100 },
      ]);

    const response = await request(app).get('/api/farmer/financials/summary');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalIncome', 1000);
    expect(response.body).toHaveProperty('totalExpenses', 300);
  });
});