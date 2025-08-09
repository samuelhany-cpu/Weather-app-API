const rateLimit = require('express-rate-limit');

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many requests from this IP, please try again later',
            code: 'RATE_LIMITED',
            statusCode: 429
        },
        timestamp: new Date().toISOString()
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Weather API specific rate limit
const weatherLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit weather requests to 30 per minute per IP
    message: {
        success: false,
        error: {
            message: 'Too many weather requests, please wait before trying again',
            code: 'WEATHER_RATE_LIMITED',
            statusCode: 429,
            details: 'Maximum 30 requests per minute allowed'
        },
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
    // Removed custom keyGenerator to fix IPv6 issue
});

// Strict rate limit for health checks (prevent spam)
const healthLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 health checks per minute per IP
    message: {
        success: false,
        error: {
            message: 'Too many health check requests',
            code: 'HEALTH_RATE_LIMITED',
            statusCode: 429
        },
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    weatherLimiter,
    healthLimiter
};
