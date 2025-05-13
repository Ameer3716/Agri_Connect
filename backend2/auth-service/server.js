import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/db.js';
import initializePassportConfig from './config/passport.js';
import redisClient from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import setupSwagger from './swagger/swagger.js'; // Import Swagger setup

dotenv.config();

connectDB();
initializePassportConfig(passport);

const app = express();

// CORS Configuration
const corsOptionsAuth = {
  origin: function (origin, callback) {
    const gatewayPort = process.env.API_GATEWAY_PORT || 5000;
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
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
app.use(cors(corsOptionsAuth));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Passport Middleware
app.use(passport.initialize());

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup Swagger UI
setupSwagger(app);

// Mount Routers
app.use('/', authRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth Service running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold);
  if (redisClient && (redisClient.isOpen || (redisClient.constructor.name === 'MockRedisClient' && redisClient.isReady))) {
    console.log('AuthService: Redis client is connected or mock is active.'.green);
  } else {
    console.log('AuthService: Redis client not connected. Waiting for connection or using mock...'.yellow);
  }
});
