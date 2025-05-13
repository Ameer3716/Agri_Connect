import { createClient } from 'redis';
import dotenv from 'dotenv';
import MockRedisClient from './MockRedisClient.js';  // wherever you keep it

dotenv.config();

const MAX_REDIS_RETRIES = 3;
let usingMockRedis = false;

// Build client with TLS and proper reconnectStrategy
const clientOpts = {
  socket: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    tls: true,
    reconnectStrategy: retries => {
      if (retries >= MAX_REDIS_RETRIES) return false;
      return Math.min(200 * retries, 3000);
    },
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};
const redisClient = createClient(clientOpts);

// Error handler that actually calls isOpen()/isReady()
redisClient.on('error', err => {
  console.error('Redis Error:', err);
  if (!redisClient.isOpen() && !redisClient.isReady() && !usingMockRedis) {
    console.warn('Switching to in-memory fallback.');
    usingMockRedis = true;
    // reassign to mock
    module.exports = new MockRedisClient();
  }
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis Cloud ✔️');
  } catch (err) {
    console.error('Initial Redis connect failed:', err);
    if (!usingMockRedis) {
      console.warn('Falling back to in-memory cache.');
      usingMockRedis = true;
      module.exports = new MockRedisClient();
    }
  }
})();

export default redisClient;
