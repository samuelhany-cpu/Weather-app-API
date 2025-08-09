const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// GET /weather?city=CityName
router.get('/', async (req, res) => {
    try {
        const { city } = req.query;
        
        // Handle missing city parameter
        if (!city) {
            return res.status(400).json({ 
                error: 'City parameter is required',
                message: 'Usage: /weather?city=CityName',
                example: '/weather?city=London'
            });
        }

        // Validate city parameter
        if (typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Invalid city parameter',
                message: 'City must be a non-empty string'
            });
        }

        // Check city name length (reasonable limits)
        if (city.trim().length > 100) {
            return res.status(400).json({ 
                error: 'City name too long',
                message: 'City name must be less than 100 characters'
            });
        }
        
        const weatherData = await weatherService.getWeather(city);
        res.json({
            success: true,
            data: weatherData,
            source: 'weather-api-wrapper',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in weather route:', error.message);
        
        // Send appropriate error response
        const statusCode = error.message.includes('Invalid city name') ? 404 :
                          error.message.includes('Invalid API key') ? 401 :
                          error.message.includes('timeout') ? 408 :
                          error.message.includes('connect') ? 503 : 500;

        res.status(statusCode).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
