const express = require("express")
const dotenv = require("dotenv")
const path = require("path")
const cors = require("cors")

dotenv.config()

const app = express()

// Enable CORS for all routes
app.use(cors())

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')))

const weatherRoutes = require("./routes/weather")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.use("/weather", weatherRoutes)

module.exports = app
