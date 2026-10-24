const { createClient } = require('redis');

class MemoryCacheFallback {
  constructor() {
    this.store = new Map();
    this.timeouts = new Map();
    this.isReady = true;
  }

  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async set(key, value, options = {}) {
    this.store.set(key, value);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    if (options.EX) {
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.timeouts.delete(key);
      }, options.EX * 1000);
      this.timeouts.set(key, timeout);
    }
    return 'OK';
  }

  async del(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
  }
}

let redisClient = null;
let isRedisConnected = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2500,
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            return false; // Stop reconnecting and fall back to memory
          }
          return 500;
        },
      },
    });

    client.on('error', (err) => {
      if (!isRedisConnected) {
        // Suppress repeated connection logs if offline
      }
    });

    await client.connect();
    isRedisConnected = true;
    redisClient = client;
    console.log('✅ Connected to Redis cache service');
    return redisClient;
  } catch (err) {
    console.log('ℹ️ Redis server unavailable. Activated resilient In-Memory Cache fallback.');
    redisClient = new MemoryCacheFallback();
    return redisClient;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new MemoryCacheFallback();
  }
  return redisClient;
};

module.exports = {
  initRedis,
  getRedisClient,
  isRedisConnected: () => isRedisConnected,
};
