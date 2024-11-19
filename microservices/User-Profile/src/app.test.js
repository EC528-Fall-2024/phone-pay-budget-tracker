// src/profile/app.test.js

jest.mock('axios');
jest.mock('jsonwebtoken');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const { lambda_handler, lambda_handler_setProfile } = require('./app');

describe('User Profile Microservice Tests', () => {
    beforeAll(() => {
        process.env.TABLE_NAME = 'test-profileData';
        process.env.AWS_REGION = 'us-east-1';
        process.env.USER_POOL_ID = 'us-east-1_example';
    });

    afterEach(() => {
        AWSMock.restore();
        jest.clearAllMocks();
    });

    test('lambda_handler - success', async () => {
        const mockItem = { pk: 'user123', email: 'user@example.com' };

        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, { Item: mockItem });
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            queryStringParameters: { pk: 'user123' },
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(mockItem);
    });

    test('lambda_handler - missing pk', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, {});
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler(event);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ error: 'Missing user id (pk)' });
    });

    test('lambda_handler - profile not found', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, {}); // Simulate no item found
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            queryStringParameters: { pk: 'user123' },
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler(event);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({ error: 'Profile not found' });
    });

    test('lambda_handler_setProfile - success', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            body: JSON.stringify({
                pk: 'user123',
                email: 'user@example.com',
                profilePhoto: 'https://example.com/photo.jpg',
            }),
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler_setProfile(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ message: 'Profile data saved successfully' });
    });

    test('lambda_handler_setProfile - DynamoDB error', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(new Error('DynamoDB Error'), null);
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            body: JSON.stringify({
                pk: 'user123',
                email: 'user@example.com',
                profilePhoto: 'https://example.com/photo.jpg',
            }),
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler_setProfile(event);
        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('DynamoDB Error');
    });

    test('lambda_handler_setProfile - missing pk', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        // Mock Cognito token validation
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB',
                },
            ],
        };
        axios.get.mockResolvedValue({ data: mockJwks });
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
        jwt.verify.mockReturnValue({ sub: 'user123' });

        const event = {
            body: JSON.stringify({
                email: 'user@example.com',
                profilePhoto: 'https://example.com/photo.jpg',
            }),
            headers: {
                Authorization: 'Bearer valid-token',
            },
        };

        const response = await lambda_handler_setProfile(event);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Missing user id (pk)');
    });

    test('lambda_handler - invalid token', async () => {
        // Mock Cognito token validation to fail
        axios.get.mockResolvedValue({ data: { keys: [] } });
        jwt.decode.mockReturnValue(null);
        jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

        const event = {
            headers: {
                Authorization: 'Bearer invalid-token',
            },
            queryStringParameters: { pk: 'user123' },
        };

        const response = await lambda_handler(event);
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toEqual({ error: 'Unauthorized' });
    });

    test('lambda_handler_setProfile - invalid token', async () => {
        // Mock Cognito token validation to fail
        axios.get.mockResolvedValue({ data: { keys: [] } });
        jwt.decode.mockReturnValue(null);
        jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

        const event = {
            body: JSON.stringify({
                pk: 'user123',
                email: 'user@example.com',
                profilePhoto: 'https://example.com/photo.jpg',
            }),
            headers: {
                Authorization: 'Bearer invalid-token',
            },
        };

        const response = await lambda_handler_setProfile(event);
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Unauthorized');
    });
});
