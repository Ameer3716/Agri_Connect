import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import farmTaskRoutes from '../../routes/farmer/farmTaskRoutes.js';
import FarmTask from '../../models/farmer/FarmTask.js';

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

const mockFarmTaskSave = jest.fn();
const mockFarmTaskDeleteOne = jest.fn();
const mockFarmTaskFind = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
const mockFarmTaskFindById = jest.fn();

jest.mock('../../models/farmer/FarmTask.js', () => {
  return jest.fn().mockImplementation(data => ({
    ...data,
    _id: data._id || mockObjectId(),
    farmer: data.farmer || mockFarmerId,
    save: mockFarmTaskSave,
  }));
});

FarmTask.find = mockFarmTaskFind;
FarmTask.findById = mockFarmTaskFindById;
FarmTask.deleteOne = mockFarmTaskDeleteOne;

const app = express();
app.use(express.json());
app.use('/api/farmer/tasks', farmTaskRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

describe('Farm Task API Routes - Happy Paths', () => {
  let sampleFarmTask;
  let sampleFarmTaskData;

  beforeEach(() => {
    mockFarmTaskSave.mockReset();
    mockFarmTaskDeleteOne.mockReset();
    mockFarmTaskFind.mockReset().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockFarmTaskFindById.mockReset();

    sampleFarmTaskData = {
      task: 'Water crops',
      description: 'Water the tomato field',
      due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'High',
      status: 'Pending',
    };
    sampleFarmTask = { _id: mockObjectId(), farmer: mockFarmerId, ...sampleFarmTaskData };

    mockFarmTaskFind.mockReturnValue({ sort: jest.fn().mockResolvedValue([sampleFarmTask]) });
    mockFarmTaskSave.mockResolvedValue(sampleFarmTask);
    mockFarmTaskFindById.mockImplementation(id => {
      if (id === sampleFarmTask._id) {
        return Promise.resolve({
          ...sampleFarmTask,
          farmer: { toString: () => mockFarmerId },
          save: mockFarmTaskSave.mockResolvedValue(sampleFarmTask)
        });
      }
      return Promise.resolve(null);
    });
    mockFarmTaskDeleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  it('GET /api/farmer/tasks - should get all tasks for the farmer', async () => {
    const response = await request(app).get('/api/farmer/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleFarmTask]);
  });

  it('POST /api/farmer/tasks - should create a new task with valid data', async () => {
    const response = await request(app).post('/api/farmer/tasks').send(sampleFarmTaskData);
    expect(response.status).toBe(201);
    expect(response.body.task).toBe(sampleFarmTaskData.task);
  });

  it('GET /api/farmer/tasks/:id - should get a single task by ID if owned by farmer', async () => {
    const response = await request(app).get(`/api/farmer/tasks/${sampleFarmTask._id}`);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(sampleFarmTask._id);
  });

  it('PUT /api/farmer/tasks/:id - should update task if owned by farmer', async () => {
    const updates = { status: 'Completed' };
    mockFarmTaskSave.mockResolvedValueOnce({ ...sampleFarmTask, ...updates });
    const response = await request(app).put(`/api/farmer/tasks/${sampleFarmTask._id}`).send(updates);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(updates.status);
  });

  it('DELETE /api/farmer/tasks/:id - should delete task if owned by farmer', async () => {
    const response = await request(app).delete(`/api/farmer/tasks/${sampleFarmTask._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task removed successfully');
  });
});