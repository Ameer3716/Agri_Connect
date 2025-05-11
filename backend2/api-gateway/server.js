

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan'; // For logging requests

dotenv.config();

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error (Gateway): Origin ${origin} not allowed.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
app.use(cors(corsOptions));

// --- Request Logging ---
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Common Proxy Middleware Options (excluding target) ---
const commonProxyOptionsBase = {
  changeOrigin: true,
  ws: true, // For WebSocket support if needed
  logLevel: 'debug', // Enable detailed proxy logging for debugging
  onProxyReq: (proxyReq, req, res) => {
    // Forward body for POST, PUT, PATCH requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      let bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type','application/json'); // Ensure downstream service gets JSON
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Example: Modify headers from the downstream service if needed
    // proxyRes.headers['X-Proxied-By'] = 'API-Gateway';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message); // Log specific error message
    if (res && !res.headersSent) { // Check if res is defined
      res.status(502).send('Proxy error or upstream service unavailable.'); // 502 Bad Gateway
    } else if (!res) {
        console.error("Response object undefined in proxy onError handler for request:", req.url);
    }
  }
};

// --- Proxy Routes ---

// Proxy /api/auth requests to Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL, // e.g., http://localhost:5001
  pathRewrite: {
    '^/api/auth': '/', // Rewrites /api/auth/login to /login for auth-service
  },
  ...commonProxyOptionsBase
}));

// Proxy requests to Main Service
// Define all API paths to proxy to Main Service
const mainServicePaths = [
  '/api/farmer',
  '/api/marketplace',
  '/api/admin'
];

// Create separate proxy middleware for each path pattern
// Using object form of pathRewrite for http-proxy-middleware v3.x
app.use('/api/farmer', createProxyMiddleware({
  target: process.env.MAIN_SERVICE_URL, // e.g., http://localhost:5002
  pathRewrite: {
    '^/api/farmer': '/farmer', // Rewrites /api/farmer/cropplans to /farmer/cropplans
  },
  ...commonProxyOptionsBase
}));

app.use('/api/marketplace', createProxyMiddleware({
  target: process.env.MAIN_SERVICE_URL,
  pathRewrite: {
    '^/api/marketplace': '/marketplace',
  },
  ...commonProxyOptionsBase
}));

app.use('/api/admin', createProxyMiddleware({
  target: process.env.MAIN_SERVICE_URL,
  pathRewrite: {
    '^/api/admin': '/admin',
  },
  ...commonProxyOptionsBase
}));

// Basic root route for the gateway
app.get('/', (req, res) => {
  res.send('API Gateway is running.');
});

// Add a logging middleware for all requests
app.use((req, res, next) => {
  console.log(`API Gateway received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Catch-all for unproxied routes
app.use((req, res) => {
  console.log(`Gateway: Unmatched route - ${req.method} ${req.originalUrl}`);
  res.status(404).send('Route not found or not proxied.');
});

// Proxy /api/marketplace requests to Main Service
app.use('/api/marketplace', createProxyMiddleware({
  target: process.env.MAIN_SERVICE_URL, // e.g., http://localhost:5002
  pathRewrite: {
    '^/api/marketplace': '/marketplace', // Rewrites /api/marketplace/listings to /marketplace/listings for main-service
  },
  ...commonProxyOptionsBase
}));

// Proxy /api/admin requests to Main Service
app.use('/api/admin', createProxyMiddleware({
  target: process.env.MAIN_SERVICE_URL, // e.g., http://localhost:5002
  pathRewrite: {
    '^/api/admin': '/admin', // Rewrites /api/admin/users to /admin/users for main-service
  },
  ...commonProxyOptionsBase
}));


// Basic root route for the gateway (optional)
app.get('/', (req, res) => {
  res.send('API Gateway is running.');
});

// --- Catch-all for unproxied routes (good for debugging) ---
// This should come AFTER all your proxy routes
app.use((req, res, next) => {
  // If the request reaches here, it means none of the proxy rules above matched.
  // This is effectively a 404 for the gateway itself if no other middleware handles it.
  if (!res.headersSent) {
    console.log(`Gateway: Unmatched route - ${req.method} ${req.originalUrl}`);
    res.status(404).send({ message: `Route ${req.method} ${req.originalUrl} not found on API Gateway.` });
  }
});

const PORT = process.env.API_GATEWAY_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`Proxying to Auth Service: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`Proxying to Main Service: ${process.env.MAIN_SERVICE_URL}`);
});





