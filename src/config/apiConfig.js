/**
 * API Configuration
 * Centralized configuration for all API endpoints and features
 */

module.exports = {
    // API Endpoints Configuration
    endpoints: {
        current: '/current.json',
        forecast: '/forecast.json',
        history: '/history.json',
        search: '/search.json',
        airQuality: '/current.json' // Air quality is included in current weather
    },

    // Cache Configuration
    cache: {
        keys: {
            current: (city) => `weather:current:${city.toLowerCase()}`,
            forecast: (city, days) => `weather:forecast:${city.toLowerCase()}:${days}d`,
            airQuality: (city) => `weather:air:${city.toLowerCase()}`
        },
        ttl: {
            current: 3600, // 1 hour for current weather
            forecast: 7200, // 2 hours for forecast
            airQuality: 3600 // 1 hour for air quality
        }
    },

    // Rate Limiting Configuration
    rateLimits: {
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100
        },
        weather: {
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 30
        },
        forecast: {
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 10 // Forecast requests are more expensive
        }
    },

    // API Parameters
    parameters: {
        forecast: {
            maxDays: 10, // Maximum forecast days
            defaultDays: 3,
            includeHourly: true
        },
        current: {
            includeAirQuality: false // Can be enabled per request
        }
    },

    // Response Format Configuration
    response: {
        includeMetadata: true,
        includeTimestamp: true,
        includeSource: true,
        standardizeUnits: true
    },

    // Feature Flags
    features: {
        airQuality: false, // Enable when implementing air quality
        forecast: false,   // Enable when implementing forecast
        history: false,    // Enable when implementing historical data
        alerts: false      // Enable when implementing weather alerts
    }
};
