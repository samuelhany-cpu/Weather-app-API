/**
 * Cache Service using Redis
 * 
 * This service manages Redis caching operations with graceful fallback.
 * Features:
 * - Automatic connection handling
 * - Graceful degradation when Redis is unavailable
 * - TTL (Time To Live) support
 * - Error logging and recovery
 */

const redis = require('redis');

// Create Redis client with connection parameters from environment
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

let isRedisConnected = false;
let redisWarningShown = false; // Prevent spam warnings

// Redis event handlers for connection management
client.on('error', (err) => {
  // Show warning only once to avoid console spam
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

// Attempt to connect to Redis (non-blocking if fails)
client.connect().catch((err) => {
  if (!redisWarningShown) {
    console.warn('⚠️  Redis connection failed - running without cache');
    redisWarningShown = true;
  }
  isRedisConnected = false;
});

/**
 * Get cached value by key
 * @param {string} key - Cache key to retrieve
 * @returns {Promise<string|null>} Cached value or null if not found/Redis unavailable
 */
const get = async (key) => {
  // Return null immediately if Redis is not connected (graceful fallback)
  if (!isRedisConnected) {
    return null;
  }
  
  try {
    const data = await client.get(key);
    return data; // Returns null if key doesn't exist
  } catch (error) {
    console.warn('Error getting from cache:', error.message);
    return null; // Graceful fallback on error
  }
};

/**
 * Set cached value with optional TTL
 * @param {string} key - Cache key
 * @param {string} value - Value to cache (should be serialized)
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<void>}
 */
const set = async (key, value, ttl) => {
  // Silently skip caching if Redis is not available
  if (!isRedisConnected) {
    return;
  }
  
  try {
    if (ttl) {
      // Set with expiration time
      await client.setEx(key, parseInt(ttl), value);
    } else {
      // Set without expiration
      await client.set(key, value);
    }
  } catch (error) {
    console.warn('Error setting cache:', error.message);
    // Don't throw error - graceful degradation
  }
};

/**
 * Delete cached value by key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} True if key was deleted, false otherwise
 */
const del = async (key) => {
  if (!isRedisConnected) {
    return false;
  }
  
  try {
    const result = await client.del(key);
    return result > 0; // Returns true if key was deleted
  } catch (error) {
    console.warn('Error deleting from cache:', error.message);
    return false;
  }
};

/**
 * Check if Redis is connected and available
 * @returns {boolean} Connection status
 */
const isConnected = () => {
  return isRedisConnected;
};

/**
 * Gracefully close Redis connection
 * @returns {Promise<void>}
 */
const close = async () => {
  if (isRedisConnected) {
    await client.quit();
  }
};

module.exports = {
  get,
  set,
  del,
  isConnected,
  close
};
