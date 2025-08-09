# 🌤️ Weather API Wrapper

A modern, full-stack weather application built with Node.js, Express, Redis caching, and a beautiful responsive frontend.

## ✨ Features

- **🌍 Real-time Weather Data**: Get current weather for any city worldwide
- **⚡ Redis Caching**: 12-hour cache for improved performance
- **🎨 Beautiful UI**: Modern, responsive frontend with gradient design
- **📱 Mobile Friendly**: Works perfectly on all devices
- **🔄 Graceful Fallback**: Works with or without Redis
- **🌡️ Comprehensive Data**: Temperature, humidity, wind, UV index, and more
- **🔍 Advanced Details**: Heat index, wind chill, solar radiation, etc.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Redis (optional, but recommended)
- WeatherAPI.com API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samuelhany-cpu/Weather-app-API.git
   cd weather-api-wrapper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   WEATHER_API_KEY=your_api_key_here
   WEATHER_API_URL=http://api.weatherapi.com/v1
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   CACHE_EXPIRY=43200
   PORT=3000
   ```

4. **Get API Key**
   - Sign up at [WeatherAPI.com](https://weatherapi.com)
   - Copy your API key to `.env`

5. **Start Redis** (Optional)
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Or install locally (Windows/WSL)
   sudo apt install redis-server
   redis-server
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - API: `http://localhost:3000`
   - Frontend: `http://localhost:3000` (served statically)

## 📡 API Endpoints

### GET `/weather?city={cityName}`

Get weather data for a specific city.

**Example Request:**
```bash
curl "http://localhost:3000/weather?city=Cairo"
```

**Example Response:**
```json
{
  "location": {
    "name": "Cairo",
    "region": "Al Qahirah",
    "country": "Egypt",
    "lat": 30.05,
    "lon": 31.25,
    "localtime": "2025-08-09 12:35"
  },
  "current": {
    "temp_c": 33.3,
    "temp_f": 91.9,
    "condition": {
      "text": "Sunny",
      "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png"
    },
    "wind_kph": 5,
    "humidity": 41,
    "pressure_mb": 1008,
    "uv": 9.9
    // ... more data
  }
}
```

## 🏗️ Architecture

```
Frontend (Static Files) → Express Server → Cache Check → WeatherAPI.com
                                        ↓
                                   Redis Cache
```

### File Structure
```
weather-api-wrapper/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── style.css          # Responsive CSS
│   └── script.js          # Frontend JavaScript
├── src/
│   ├── app.js             # Express app configuration
│   ├── server.js          # Server startup
│   ├── routes/
│   │   └── weather.js     # Weather route handler
│   ├── services/
│   │   ├── weatherService.js  # Weather API logic
│   │   └── cacheService.js    # Redis caching
│   └── utils/
│       └── logger.js      # Logging utilities
├── .env                   # Environment variables
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEATHER_API_KEY` | WeatherAPI.com API key | Required |
| `WEATHER_API_URL` | WeatherAPI base URL | `http://api.weatherapi.com/v1` |
| `REDIS_HOST` | Redis server host | `127.0.0.1` |
| `REDIS_PORT` | Redis server port | `6379` |
| `CACHE_EXPIRY` | Cache expiry in seconds | `43200` (12 hours) |
| `PORT` | Server port | `3000` |

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start src/server.js --name weather-app
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

Test the API endpoints:
```bash
# Test basic endpoint
curl "http://localhost:3000/weather?city=London"

# Test error handling
curl "http://localhost:3000/weather"
```

## 🔍 Monitoring

The application logs:
- ✅ Redis connection status
- 📡 Data source (Cache vs API)
- ⚠️ Error messages
- 🚀 Server startup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WeatherAPI.com](https://weatherapi.com) for weather data
- [Express.js](https://expressjs.com) for the web framework
- [Redis](https://redis.io) for caching
- [Font Awesome](https://fontawesome.com) for icons

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ and Node.js**