const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { createErrorResponse, createSuccessResponse } = require('../utils/apiResponse');

// GET /weather?city=CityName
router.get('/', async (req, res) => {
    try {
        const { city } = req.query;
        
        // Handle missing city parameter
        if (!city) {
            return res.status(400).json(createErrorResponse(
                'City parameter is required',
                400,
                'MISSING_CITY',
                'Usage: /weather?city=CityName'
            ));
        }

        // Validate city parameter
        if (typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json(createErrorResponse(
                'Invalid city parameter',
                400,
                'INVALID_CITY',
                'City must be a non-empty string'
            ));
        }

        // Check city name length (reasonable limits)
        if (city.trim().length > 100) {
            return res.status(400).json(createErrorResponse(
                'City name too long',
                400,
                'CITY_TOO_LONG',
                'City name must be less than 100 characters'
            ));
        }
        
        const weatherData = await weatherService.getWeather(city);
        res.json(createSuccessResponse(weatherData, 'Weather data retrieved successfully'));
    } catch (error) {
        console.error('Error in weather route:', error.message);
        
        // Send appropriate error response
        const statusCode = error.message.includes('Invalid city name') ? 404 :
                          error.message.includes('Invalid API key') ? 401 :
                          error.message.includes('timeout') ? 408 :
                          error.message.includes('connect') ? 503 : 500;

        res.status(statusCode).json(createErrorResponse(error.message, statusCode));
    }
});

module.exports = router;
