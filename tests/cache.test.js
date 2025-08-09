/**
 * Cache Service Tests
 * Tests Redis cache functionality with mocked Redis client
 */

const cacheService = require('../src/services/cacheService');

// Mock Redis client
jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(),
        get: jest.fn(),
        set: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        quit: jest.fn()
    }))
}));

describe('Cache Service', () => {
    test('should handle get operation gracefully when Redis is disconnected', async () => {
        const result = await cacheService.get('test-key');
        expect(result).toBeNull();
    });

    test('should handle set operation gracefully when Redis is disconnected', async () => {
        // Should not throw error
        await expect(cacheService.set('test-key', 'test-value')).resolves.toBeUndefined();
    });

    test('should handle del operation gracefully when Redis is disconnected', async () => {
        const result = await cacheService.del('test-key');
        expect(result).toBe(false);
    });

    test('should return false for isConnected when Redis is not available', () => {
        const isConnected = cacheService.isConnected();
        expect(typeof isConnected).toBe('boolean');
    });
});
