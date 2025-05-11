// backend/main-service/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
// import axios from 'axios'; // Uncomment if using auth-service /verify-token endpoint

// User model is no longer directly accessible here for User.findById
// req.user will be populated directly from the JWT payload.

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
        console.error('MainService: Error parsing token from header:', error);
        res.status(401);
        throw new Error('Not authorized, token format invalid');
    }
  }

  if (token) {
    try {
      // Option 1: Verify JWT locally using the shared secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Populate req.user with payload from the token.
      // The auth-service is responsible for putting correct `id` and `userType` in the token.
      // If other user details are needed frequently, they should be in the token payload.
      // Or, make a call to auth-service for more details (less performant for every request).
      req.user = {
          _id: decoded.id, // Assuming 'id' is the field in JWT payload
          // Add other fields from token if auth-service includes them (e.g., userType, email)
          // Example: userType: decoded.userType, email: decoded.email
      };

      // IMPORTANT: Fetch userType from token to use in role checks.
      // Ensure auth-service's generateToken includes userType in the JWT payload.
      // If generateToken in auth-service is: jwt.sign({ id, userType }, secret)
      // Then here you'd have:
      // req.user = { _id: decoded.id, userType: decoded.userType };

      // For now, let's assume the token ONLY has `id`.
      // We will need to adjust how `farmer` and `admin` middleware get `userType`.
      // EITHER:
      //    a) Auth service includes `userType` in the JWT token. (PREFERRED)
      //    b) This middleware calls auth-service to get user details including `userType`. (SLOWER)

      // --- Let's assume auth-service's generateToken.js is updated to include userType ---
      // In auth-service/utils/generateToken.js:
      // export const generateToken = (userId, userType) => {
      //   return jwt.sign({ id: userId, userType }, process.env.JWT_SECRET, { ... });
      // };
      // And authController calls it with user._id and user.userType

      if (decoded.userType) {
        req.user.userType = decoded.userType;
      } else {
        // Fallback or error if userType is critical and not in token
        // This indicates an issue with token generation in auth-service
        console.warn('MainService: userType not found in JWT payload. Role checks might fail.');
        // For critical role checks, you might want to throw an error here or fetch from auth-service
      }

      if (!req.user._id) { // Basic check
        res.status(401);
        throw new Error('Not authorized, token invalid (user ID missing)');
      }
      
      next();

    } catch (error) {
      console.error('MainService: Token verification failed:', error.message);
      res.status(401);
      if (error.name === 'TokenExpiredError') {
          throw new Error('Not authorized, token expired');
      }
      throw new Error('Not authorized, token failed or invalid');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Role-based authorization: farmer
const farmer = (req, res, next) => {
  // req.user should be populated by `protect` middleware from the JWT payload
  if (req.user && req.user.userType === 'Farmer') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as a Farmer');
  }
};

// Role-based authorization: admin
const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'Admin') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as an admin');
  }
};

export { protect, farmer, admin };