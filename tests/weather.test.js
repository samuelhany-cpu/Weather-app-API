/**
 * Weather API Tests
 * Tests the /weather endpoint functionality and error handling
 */

const request = require('supertest');
const app = require('../src/app');

// Mock the weather service to avoid real API calls during testing
jest.mock('../src/services/weatherService');
const weatherService = require('../src/services/weatherService');

describe('Weather API Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /weather', () => {
        test('should return 400 when city parameter is missing', async () => {
            const response = await request(app)
                .get('/weather')
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('City parameter is required');
        });

        test('should return 400 when city parameter is empty', async () => {
            const response = await request(app)
                .get('/weather?city=')
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('City parameter is required');
        });

        test('should return 400 when city name is too long', async () => {
            const longCityName = 'a'.repeat(101);
            const response = await request(app)
                .get(`/weather?city=${longCityName}`)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('City name too long');
        });

        test('should return weather data for valid city', async () => {
            const mockWeatherData = {
                location: { name: 'London', country: 'UK' },
                current: { temp_c: 20, condition: { text: 'Sunny' } }
            };

            weatherService.getWeather.mockResolvedValue(mockWeatherData);

            const response = await request(app)
                .get('/weather?city=London')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockWeatherData);
            expect(response.body.meta.source).toBe('weather-api-wrapper');
            expect(weatherService.getWeather).toHaveBeenCalledWith('London');
        });

        test('should handle service errors appropriately', async () => {
            weatherService.getWeather.mockRejectedValue(new Error('Invalid city name: City not found'));

            const response = await request(app)
                .get('/weather?city=InvalidCity')
                .expect(404);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid city name');
        });

        test('should handle API key errors', async () => {
            weatherService.getWeather.mockRejectedValue(new Error('Invalid API key'));

            const response = await request(app)
                .get('/weather?city=London')
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid API key');
        });

        test('should handle timeout errors', async () => {
            weatherService.getWeather.mockRejectedValue(new Error('Request timeout'));

            const response = await request(app)
                .get('/weather?city=London')
                .expect(408);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('timeout');
        });
    });
});
