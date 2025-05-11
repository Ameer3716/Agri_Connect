import { createClient } from 'redis';
import dotenv from 'dotenv'; // Ensure dotenv is configured early in your app

dotenv.config(); // Load .env variables

// --- Mock Redis Client (for fallback) ---
class MockRedisClient {
  constructor() {
    this.storage = new Map();
    this.connected = true;
    console.log('USING IN-MEMORY CACHE (MockRedisClient).');
  }
  async connect() { return Promise.resolve(); }
  async get(key) {
    const item = this.storage.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.storage.delete(key);
      return null;
    }
    return item.value;
  }
  async set(key, value, options = {}) {
    let expiry = null;
    if (options.EX) expiry = Date.now() + (options.EX * 1000);
    this.storage.set(key, { value, expiry });
    return 'OK';
  }
  async del(key) { this.storage.delete(key); return 1; }
  on(event, handler) {
    // console.log(`MockRedisClient: Event registration - ${event}`);
    return this;
  }
  async quit() { this.connected = false; return Promise.resolve(); }
  isOpen() { return this.connected; }
  isReady() { return this.connected; } // Common check
}
// --- End Mock Redis Client ---

let redisClient;
let usingMockRedis = false;

const MAX_REDIS_RETRIES = 3; // How many times to try reconnecting before fallback

const redisConnectionString = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_USERNAME || !process.env.REDIS_PASSWORD) {
  console.warn(
    'Redis Cloud environment variables (REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD) are not fully set. Attempting fallback or local.'
  );
  // Optionally, you could try process.env.REDIS_URL_LOCAL here or default to mock immediately
  // For now, we'll let it try and fail if cloud vars aren't complete, then go to mock.
}

try {
  console.log(`Attempting to connect to Redis Cloud using URL: redis://<username>:<password>@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

  redisClient = createClient({
    url: redisConnectionString,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries >= MAX_REDIS_RETRIES) {
          if (!usingMockRedis) {
            console.error(`Redis connection failed after ${MAX_REDIS_RETRIES} retries. Switching to in-memory fallback.`);
            // The error returned here signals the client to stop retrying.
            // The actual switch to mock happens in error handlers or initial connect catch.
          }
          return new Error('Too many retries. Giving up on Redis connection.'); // Stop retrying
        }
        console.log(`Redis: Reconnect attempt ${retries + 1}...`);
        return Math.min(retries * 200, 3000); // Exponential backoff
      },
    },
  });

  redisClient.on('error', (err) => {
    // Log the full error object to get more details
    console.error('Redis Client Error Event:', err);
    // If the client is not open and we are not already using mock, switch to mock
    // This handles errors after initial connection or during reconnections if connect() didn't catch it
    if ((!redisClient.isOpen && !redisClient.isReady) && !usingMockRedis) {
        console.warn('Switching to in-memory fallback due to Redis error.');
        redisClient = new MockRedisClient(); // Switch to mock
        usingMockRedis = true;
    }
  });

  redisClient.on('connect', () => {
    if (!usingMockRedis) console.log('Redis: Connecting...');
  });

  redisClient.on('ready', () => {
    if (!usingMockRedis) console.log('Redis: Client is ready.');
  });

  redisClient.on('reconnecting', () => {
    if (!usingMockRedis) console.log('Redis: Client is reconnecting...');
  });

  // Asynchronous IIFE to connect and handle initial failure
  (async () => {
    try {
      await redisClient.connect();
      if (!usingMockRedis) { // Should be true unless an error event already switched to mock
          console.log('Successfully connected to Redis Cloud.');
      }
    } catch (err) {
      console.error('Failed initial Redis connection attempt:', err);
      if (!usingMockRedis) {
        console.warn('Switching to in-memory fallback after initial connection failure.');
        redisClient = new MockRedisClient();
        usingMockRedis = true;
      }
    }
  })();

} catch (e) {
  // This catch is for errors during createClient() itself, which is rare.
  console.error('Critical error creating Redis client:', e);
  if (!usingMockRedis) {
    console.warn('Using in-memory fallback due to critical client creation error.');
    redisClient = new MockRedisClient();
    usingMockRedis = true;
  }
}

export default redisClient;