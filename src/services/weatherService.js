const axios = require("axios")
const cacheService = require("./cacheService")
const logger = require("../utils/logger")

const getWeather = async (city) => {
    // Validate input
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
        throw new Error('City name is required and must be a valid string');
    }

    // Normalize city name for cache key
    const normalizedCity = city.toLowerCase().trim();
    const cacheKey = `weather:${normalizedCity}`;
    
    // Check Redis cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
        logger("Cache");
        return JSON.parse(cached);
    }

    try {
        // Call WeatherAPI.com if no cache
        const response = await axios.get(
            `${process.env.WEATHER_API_URL}/current.json`,
            { 
                params: { 
                    key: process.env.WEATHER_API_KEY, 
                    q: city.trim()
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        const weatherData = response.data;

        // Save response to cache with TTL from .env
        await cacheService.set(cacheKey, JSON.stringify(weatherData), process.env.CACHE_EXPIRY);
        
        logger("API Call");
        return weatherData;
    } catch (error) {
        if (error.response) {
            // API responded with error status
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
            throw new Error('Request timeout. Please try again.');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to weather service. Please check your internet connection.');
        } else {
            console.error("Unexpected error fetching weather data:", error);
            throw new Error('An unexpected error occurred while fetching weather data.');
        }
    }
}

module.exports = {
    getWeather
};
