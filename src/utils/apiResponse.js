/**
 * Standardized error response utility
 * Ensures consistent error format across all endpoints
 */

class ApiError extends Error {
    constructor(message, statusCode = 500, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.name = 'ApiError';
    }
}

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Internal error code
 * @param {string} details - Additional error details
 * @returns {object} Standardized error response
 */
const createErrorResponse = (message, statusCode = 500, errorCode = null, details = null) => {
    const response = {
        success: false,
        error: {
            message,
            code: errorCode || getErrorCodeFromStatus(statusCode),
            statusCode
        },
        timestamp: new Date().toISOString()
    };

    if (details) {
        response.error.details = details;
    }

    return response;
};

/**
 * Create standardized success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} Standardized success response
 */
const createSuccessResponse = (data, message = 'Success', meta = {}) => {
    return {
        success: true,
        message,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            source: 'weather-api-wrapper',
            ...meta
        }
    };
};

/**
 * Get error code from HTTP status
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
const getErrorCodeFromStatus = (statusCode) => {
    const errorCodes = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        408: 'TIMEOUT',
        429: 'RATE_LIMITED',
        500: 'INTERNAL_ERROR',
        503: 'SERVICE_UNAVAILABLE'
    };
    return errorCodes[statusCode] || 'UNKNOWN_ERROR';
};

/**
 * Express error handler middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            createErrorResponse(err.message, err.statusCode, err.errorCode)
        );
    }

    // Handle specific error types
    if (err.code === 'ECONNABORTED') {
        return res.status(408).json(
            createErrorResponse('Request timeout', 408, 'TIMEOUT')
        );
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        return res.status(503).json(
            createErrorResponse('Service unavailable', 503, 'SERVICE_UNAVAILABLE')
        );
    }

    // Default error response
    res.status(500).json(
        createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    );
};

module.exports = {
    ApiError,
    createErrorResponse,
    createSuccessResponse,
    errorHandler
};
