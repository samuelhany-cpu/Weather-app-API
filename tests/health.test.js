/**
 * Health Endpoint Tests
 * Tests the /health endpoint functionality
 */

const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoint', () => {
    test('GET /health should return 200 status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
        
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('redis');
    });

    test('GET /health should include valid timestamp', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
        
        const timestamp = new Date(response.body.timestamp);
        expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    test('GET /health should include uptime as number', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
        
        expect(typeof response.body.uptime).toBe('number');
        expect(response.body.uptime).toBeGreaterThan(0);
    });
});
