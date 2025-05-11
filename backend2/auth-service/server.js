import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import connectDB from './config/db.js';
import initializePassportConfig from './config/passport.js'; // Your Passport config
import redisClient from './config/redis.js'; // Initialize redis connection

// Import route handlers
import authRoutes from './routes/authRoutes.js';

// Import middleware
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config(); // Load .env variables for this service

connectDB(); // Connect to MongoDB for User model

// Initialize Passport (pass the passport instance to your config function)
initializePassportConfig(passport);

const app = express();

// CORS Configuration for Auth Service
// Might be simpler if only API Gateway calls it.
// If browser directly interacts for some OAuth parts, keep it flexible.
// auth-service/server.js - UPDATED CORS
const corsOptionsAuth = {
  origin: function (origin, callback) {
    const gatewayPort = process.env.API_GATEWAY_PORT || 5000; // Add API_GATEWAY_PORT to auth-service .env too
    const gatewayOrigin = `http://localhost:${gatewayPort}`;
    const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

    const allowedOrigins = [
        gatewayOrigin,
        frontendOrigin
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error (AuthService): Origin ${origin} not allowed. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by AuthService CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], // Adjust methods as needed for auth-service
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
app.use(cors(corsOptionsAuth));


// Express Session Middleware (needed for Passport OAuth flow, even if JWT is the final auth)
// The session secret should be the same if you were to scale out auth-service instances
// and use a shared session store (like Redis for sessions).
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // True might be needed for some OAuth strategies to set a session before redirect
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true, // Protects against XSS
      sameSite: 'lax' // 'lax' is often better for OAuth redirects than 'strict'
    }
  })
);

// Passport Middleware
app.use(passport.initialize());
// app.use(passport.session()); // If your OAuth strategy strictly requires it to deserialize user into req.user from session during callback phase.
// For JWT final auth, often not needed IF req.user is populated directly in the callback from `done(null, user)`.
// Your current passport.authenticate in routes uses session: false, so this might be okay to omit.
// Test Google OAuth thoroughly. If req.user is undefined in callback, you might need passport.session().

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // For parsing JWT cookie if needed by this service, or for setting it

// --- MOUNT ROUTERS ---
// Routes will be prefixed by the API gateway, e.g., /api/auth/login -> /login here
app.use('/', authRoutes); // Mount authRoutes at the root of this service

// --- ERROR HANDLING ---
app.use(notFound); // For routes within auth-service not found
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold);
  // Check Redis connection status
  if (redisClient && (redisClient.isOpen || (redisClient.constructor.name === 'MockRedisClient' && redisClient.isReady ))) {
    console.log('AuthService: Redis client is connected or mock is active.'.green);
  } else {
    console.log('AuthService: Redis client not connected. Waiting for connection or using mock...'.yellow);
  }
});