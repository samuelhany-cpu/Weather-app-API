const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

let isRedisConnected = false;
let redisWarningShown = false;

// Connect to Redis and handle errors
client.on('error', (err) => {
  if (!redisWarningShown) {
    console.warn('⚠️  Redis not available - running without cache');
    redisWarningShown = true;
  }
  isRedisConnected = false;
});

client.on('connect', () => {
  console.log('✅ Connected to Redis - caching enabled');
  isRedisConnected = true;
});

client.on('ready', () => {
  isRedisConnected = true;
});

client.on('end', () => {
  isRedisConnected = false;
});

// Try to connect the client, but don't crash if it fails
client.connect().catch((err) => {
  if (!redisWarningShown) {
    console.warn('⚠️  Redis connection failed - running without cache');
    redisWarningShown = true;
  }
  isRedisConnected = false;
});

// Get cached value
const get = async (key) => {
  if (!isRedisConnected) {
    return null; // No cache available, return null to trigger API call
  }
  
  try {
    const data = await client.get(key);
    return data;
  } catch (error) {
    console.warn('Error getting from cache:', error.message);
    return null;
  }
};

// Set cached value with TTL (time to live)
const set = async (key, value, ttl) => {
  if (!isRedisConnected) {
    return; // No cache available, silently skip caching
  }
  
  try {
    if (ttl) {
      await client.setEx(key, parseInt(ttl), value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.warn('Error setting cache:', error.message);
  }
};

module.exports = {
  get,
  set
};
