

import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import connectSQL from './config/dbsql.js';

// Import all route handlers
import cropPlanRoutes from './routes/farmer/cropPlanRoutes.js';
import farmTaskRoutes from './routes/farmer/farmTaskRoutes.js';
import marketPriceRoutes from './routes/farmer/marketPriceRoutes.js';
import financialTransactionRoutes from './routes/farmer/financialTransactionRoutes.js';
import farmerProductListingRoutes from './routes/farmer/productListingRoutes.js';
import marketplaceListingRoutes from './routes/marketplace/listingRoutes.js';
import adminMarketplaceRoutes from './routes/admin/marketplaceAdminRoutes.js';
import adminCommunicationRoutes from './routes/admin/communicationRoutes.js';
import adminUserRoutes from './routes/admin/userAdminRoutes.js';

// Import middleware
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

connectDB();
connectSQL();

const app = express();

// Logging middleware to see exact paths received by main-service
// THIS SHOULD BE ONE OF THE FIRST MIDDLEWARE
app.use((req, res, next) => {
  console.log(`MainService RX: ${req.method} ${req.originalUrl} (Headers Origin: ${req.headers.origin})`);
  next();
});

// CORS Configuration for Main Service
const corsOptionsMain = {
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
      console.error(`CORS Error (MainService): Origin ${origin} not allowed. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by MainService CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
app.use(cors(corsOptionsMain));

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- MOUNT ROUTERS ---
const farmerRouter = express.Router();
farmerRouter.use('/cropplans', cropPlanRoutes);
farmerRouter.use('/tasks', farmTaskRoutes);
farmerRouter.use('/marketprices', marketPriceRoutes);
farmerRouter.use('/financials', financialTransactionRoutes);
farmerRouter.use('/listings', farmerProductListingRoutes); // Farmer's own listings (e.g., /farmer/listings)

const marketplaceRouter = express.Router();
marketplaceRouter.use('marketplace/listings', marketplaceListingRoutes); // Public listings (e.g., /marketplace/listings)

const adminRouter = express.Router();
adminRouter.use('/marketplace', adminMarketplaceRoutes); // Admin mgt of marketplace (e.g. /admin/marketplace/listings)
adminRouter.use('/communication', adminCommunicationRoutes);
adminRouter.use('/users', adminUserRoutes);

// Mount the main routers
app.use('', farmerRouter);           // All routes starting with /farmer
app.use('', marketplaceRouter); // All routes starting with /marketplace
app.use('', adminRouter);             // All routes starting with /admin




// --- ERROR HANDLING ---
app.use(notFound); // This will catch requests that don't match any mounted routes in main-service
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Main Service running in ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold);
  if (process.env.AUTH_SERVICE_URL) {
    console.log(`Main Service will attempt to communicate with Auth Service at: ${process.env.AUTH_SERVICE_URL}`.yellow);
  } else {
    console.warn(`AUTH_SERVICE_URL is not set in .env for Main Service. Admin functionalities may fail.`.red);
  }
  if (!process.env.API_GATEWAY_PORT) {
      console.warn("API_GATEWAY_PORT not set in .env for Main Service; CORS might default to port 5000 for gateway origin.".yellow);
  }
  if (!process.env.FRONTEND_URL) {
      console.warn("FRONTEND_URL not set in .env for Main Service; CORS might default to port 5173 for frontend origin.".yellow);
  }
});