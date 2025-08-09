const express = require("express")
const dotenv = require("dotenv")
const path = require("path")
const cors = require("cors")

// Import middleware
const { generalLimiter, weatherLimiter, healthLimiter } = require('./middleware/rateLimiter')
const { errorHandler } = require('./utils/apiResponse')

dotenv.config()

const app = express()

// Apply rate limiting to all requests
app.use(generalLimiter)

// Enable CORS for all routes
app.use(cors())

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')))

const weatherRoutes = require("./routes/weather")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint with specific rate limiting
app.get('/health', healthLimiter, (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        redis: require('./services/cacheService').isConnected()
    });
});

// Weather routes with specific rate limiting
app.use("/weather", weatherLimiter, weatherRoutes)

// Global error handler (must be last)
app.use(errorHandler)

module.exports = app
