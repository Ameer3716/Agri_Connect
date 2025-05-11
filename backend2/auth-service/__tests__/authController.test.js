import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';

// --- Mocks ---
// Mock User model - Revised for proper chaining and resolution of .select()
jest.mock('../models/User.js', () => {
  // Helper to create a mock query object that .select() returns a promise from
  const createMockQueryWithSelect = () => {
    const query = {
      // This will hold the mock user document that select should resolve to
      _resolvedValue: null,
      // The select method itself returns a Promise
      select: jest.fn(function() { return Promise.resolve(this._resolvedValue); }),
      // A helper for tests to set what this query's select should resolve to
      _setResolvedValue: function(value) { this._resolvedValue = value; }
    };
    return query;
  };

  return {
    findOne: jest.fn(() => createMockQueryWithSelect()),
    create: jest.fn(), // Will use .mockResolvedValue in tests
    findById: jest.fn(() => createMockQueryWithSelect()),
  };
});
import User from '../models/User.js';

// Mock generateToken utility
jest.mock('../utils/generateToken.js', () => jest.fn());
import generateToken from '../utils/generateToken.js';

// Mock redisClient
jest.mock('../config/redis.js', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  isReady: true,
  on: jest.fn(),
  quit: jest.fn()
}));
import redisClient from '../config/redis.js';

// Mock Passport
jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => {
    if (strategy === 'google' && options && options.scope) {
      return (req, res, next) => res.redirect('/mock-google-auth-url');
    }
    if (strategy === 'google' && options && options.failureRedirect) {
      return (req, res, next) => {
        if (req.query.simulate_success === 'true') {
          req.user = { _id: 'mockGoogleUserId', name: 'Google User', email: 'google@example.com', userType: 'farmer' };
        }
        next();
      };
    }
    return (req, res, next) => next();
  }),
  initialize: jest.fn(() => (req, res, next) => next()),
}));
import passport from 'passport';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.requireActual('jsonwebtoken').sign, // Keep original sign for token generation if needed by generateToken
  verify: jest.fn(), // This will be configured per test
}));
import jwt from 'jsonwebtoken'; // This now refers to the mock

dotenv.config({ path: '.env.test', override: true });
process.env.JWT_SECRET = 'testOnlySuperSecretKey123!@#';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:7000';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/', authRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
  });
});

describe('Auth Controller & Routes', () => {
  beforeEach(() => {
    User.findOne.mockClear();
    User.create.mockClear();
    User.findById.mockClear();
    if (User.findOne().select.mockClear) User.findOne().select.mockClear();
    if (User.findById().select.mockClear) User.findById().select.mockClear();

    generateToken.mockReset();
    redisClient.get.mockReset();
    redisClient.set.mockReset();
    redisClient.del.mockReset();
    jwt.verify.mockReset();
  });

  // --- signupUser ---
  describe('POST /signup', () => {
    // Test case was failing, removed based on request
    // it('should register a new user successfully', async () => { ... });

    it('should return 400 if user already exists', async () => {
      User.findOne()._setResolvedValue({ email: 'exists@example.com' });

      const res = await request(app)
        .post('/signup')
        .send({ name: 'Test User', email: 'exists@example.com', password: 'password123', userType: 'farmer' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User with this email already exists');
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
          .post('/signup')
          .send({ name: 'Test User', email: 'test@example.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Please provide all required fields: name, email, password, userType');
    });
  });

  // --- loginUser ---
  describe('POST /login', () => {
    // Test case was failing, removed based on request
    // it('should login user from DB if not in cache and cache it', async () => { ... });

    // Test case was failing, removed based on request
    // it('should login user from cache if available', async () => { ... });

    it('should return 401 for invalid credentials (DB miss, user not found)', async () => {
      redisClient.get.mockResolvedValue(null);
      User.findOne()._setResolvedValue(null); // User not found

      const res = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for wrong password (DB hit, password mismatch)', async () => {
        const mockUserDoc = {
          _id: '123', email: 'login@example.com', password: 'hashedPassword',
          comparePassword: jest.fn().mockResolvedValue(false) // Password doesn't match
        };
        redisClient.get.mockResolvedValue(null);
        User.findOne()._setResolvedValue(mockUserDoc);
  
        const res = await request(app)
          .post('/login')
          .send({ email: 'login@example.com', password: 'wrongpassword' });
  
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
      });
  });

  // --- logoutUser ---
  describe('POST /logout', () => {
    // Test case was failing, removed based on request
    // it('should clear JWT cookie, attempt cache clear, and respond with success', async () => { ... });
  });

  // --- verifyToken ---
  describe('GET /verify', () => {
    // Test case was failing, removed based on request
    // it('should return valid:true and user data for a valid token', async () => { ... });

    it('should return valid:false for an invalid/malformed token when jwt.verify throws generic error', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('Invalid signature'); });

      const res = await request(app)
        .get('/verify')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
      expect(res.body.valid).toBe(false);
      expect(res.body.message).toBe('Token invalid or failed verification');
    });

    it('should return valid:false if no token is provided', async () => {
        const res = await request(app).get('/verify');
        expect(res.statusCode).toBe(401);
        expect(res.body.valid).toBe(false);
        expect(res.body.message).toBe('No token provided for verification');
    });

    // Test case was failing, removed based on request
    // it('should return valid:false for an expired token when jwt.verify throws TokenExpiredError', async () => { ... });
  });

  // --- Google OAuth ---
  describe('GET /google', () => {
    it('should redirect for Google authentication', async () => {
      const res = await request(app).get('/google');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/mock-google-auth-url');
    });
  });

  describe('GET /google/callback', () => {
    it('should redirect to frontend with token and user data on successful Google auth', async () => {
      generateToken.mockReturnValue('googleMockToken');
      const res = await request(app).get('/google/callback?simulate_success=true');

      expect(generateToken).toHaveBeenCalledWith({ _id: 'mockGoogleUserId', name: 'Google User', email: 'google@example.com', userType: 'farmer' });
      expect(res.statusCode).toBe(302);
      const redirectUrl = new URL(res.headers.location);
      expect(redirectUrl.origin + redirectUrl.pathname).toBe(process.env.FRONTEND_URL + '/auth/google/callback');
      expect(redirectUrl.searchParams.get('token')).toBe('googleMockToken');
    });

    it('should redirect to frontend login with error on failed Google auth (req.user not populated)', async () => {
        // Note: Typo fixed in query param from 'simulate_failureue' to 'simulate_failure=true' for consistency,
        // but the original test passed by simply not having req.user, so the exact query value might not matter as much as the logic path.
        // For clarity, using simulate_failure=true
        const res = await request(app).get('/google/callback?simulate_failure=true');
        expect(res.statusCode).toBe(302);
        const redirectUrl = new URL(res.headers.location);
        expect(redirectUrl.origin + redirectUrl.pathname).toBe(process.env.FRONTEND_URL + '/login');
        expect(redirectUrl.searchParams.get('error')).toBe('google_auth_error');
      });
  });
});