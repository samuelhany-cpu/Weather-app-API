/**
 * Weather Service
 * 
 * This service handles weather data fetching with Redis caching.
 * It implements a cache-first strategy:
 * 1. Check Redis cache first
 * 2. If cache miss, fetch from WeatherAPI.com
 * 3. Store result in cache with TTL
 * 4. Return weather data
 */

const axios = require("axios")
const cacheService = require("./cacheService")
const logger = require("../utils/logger")

/**
 * Get weather data for a specific city
 * @param {string} city - City name to get weather for
 * @returns {Promise<object>} Weather data object
 * @throws {Error} When city is invalid or API request fails
 */
const getWeather = async (city) => {
    // Input validation: ensure city is a valid non-empty string
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
        throw new Error('City name is required and must be a valid string');
    }

    // Normalize city name for consistent cache keys (lowercase, trimmed)
    const normalizedCity = city.toLowerCase().trim();
    const cacheKey = `weather:${normalizedCity}`;
    
    // Step 1: Check Redis cache first (cache-first strategy)
    const cached = await cacheService.get(cacheKey);
    if (cached) {
        logger("Cache"); // Log cache hit
        return JSON.parse(cached);
    }

    try {
        // Step 2: Cache miss - fetch from WeatherAPI.com
        const response = await axios.get(
            `${process.env.WEATHER_API_URL}/current.json`,
            { 
                params: { 
                    key: process.env.WEATHER_API_KEY, 
                    q: city.trim() // Use original city name for API call
                },
                timeout: 10000 // 10 second timeout to prevent hanging
            }
        );
        
        const weatherData = response.data;

        // Step 3: Store result in cache with TTL from environment config
        await cacheService.set(cacheKey, JSON.stringify(weatherData), process.env.CACHE_EXPIRY);
        
        logger("API Call"); // Log API call
        return weatherData;
    } catch (error) {
        // Enhanced error handling with specific error types
        if (error.response) {
            // API responded with error status - handle different HTTP status codes
            const statusCode = error.response.status;
            const message = error.response.data?.error?.message || 'Weather data not found';
            
            if (statusCode === 400) {
                throw new Error(`Invalid city name: ${message}`);
            } else if (statusCode === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else if (statusCode === 403) {
                throw new Error('API access forbidden. Please check your subscription.');
            } else {
                throw new Error(`Weather service error: ${message}`);
            }
        } else if (error.code === 'ECONNABORTED') {
            // Request timeout
            throw new Error('Request timeout. Please try again.');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            // Network connectivity issues
            throw new Error('Unable to connect to weather service. Please check your internet connection.');
        } else {
            // Unexpected errors
            console.error("Unexpected error fetching weather data:", error);
            throw new Error('An unexpected error occurred while fetching weather data.');
        }
    }
}

module.exports = {
    getWeather
};
