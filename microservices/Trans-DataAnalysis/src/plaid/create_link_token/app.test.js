jest.mock('plaid');
jest.mock('axios');
jest.mock('jsonwebtoken');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const plaid = require('plaid');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { lambda_handler } = require('./app'); 

describe('Create Link Token Microservice Tests', () => {
    beforeAll(() => {
        process.env.PLAID_CLIENT_ID = 'test-client-id';
        process.env.PLAID_SECRET = 'test-secret';
        process.env.TABLE_NAME = 'test-profileData'; 
        process.env.AWS_REGION = 'us-east-2';
        process.env.USER_POOL_ID = 'us-east-2_example'; 
    });

    afterEach(() => {
        //AWSMock.restore('DynamoDB.DocumentClient');
        jest.clearAllMocks();
    });

    beforeEach(() => {
        // Mock Cognito JWKS response
        const mockJwks = {
            keys: [
                {
                    kid: 'test-kid',
                    kty: 'RSA',
                    n: 'test-n',
                    e: 'AQAB'
                }
            ]
        };
        axios.get.mockResolvedValue({ data: mockJwks });

        // Mock jwt.decode to return a decoded token header
        jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });

        // Mock jwt.verify to successfully verify the token
        jwt.verify.mockReturnValue({ sub: 'user123' });
    });

    test('lambda_handler - success', async () => {
        // Mock PlaidApi methods
        const mockLinkTokenData = {
            link_token: 'link-token-123',
            expiration: '2024-12-31T23:59:59Z'
        };

        plaid.PlaidApi.mockImplementation(() => ({
            linkTokenCreate: jest.fn().mockResolvedValue({
                data: mockLinkTokenData
            })
        }));

        const event = {
            headers: {
                Authorization: 'Bearer valid-token',
            },
            body: JSON.stringify({
                userId: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual(mockLinkTokenData);

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.linkTokenCreate).toHaveBeenCalledWith({
            user: { client_user_id: 'user123' },
            client_name: 'Plaid Tutorial',
            language: 'en',
            products: ['transactions'],
            country_codes: ['US'],
            webhook: 'https://www.example.com/webhook',
        });
    });

    test('lambda_handler - missing userId', async () => {
        const event = {
            headers: {
                Authorization: 'Bearer valid-token',
            },
            body: JSON.stringify({
                // userId is missing
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Missing userId' });

        // Verify that PlaidApi was not called
        expect(plaid.PlaidApi).not.toHaveBeenCalled();
    });

    test('lambda_handler - Plaid API error', async () => {
        // Mock PlaidApi to throw an error
        plaid.PlaidApi.mockImplementation(() => ({
            linkTokenCreate: jest.fn().mockRejectedValue(new Error('Plaid API Error'))
        }));

        const event = {
            headers: {
                Authorization: 'Bearer valid-token',
            },
            body: JSON.stringify({
                userId: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Plaid API Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.linkTokenCreate).toHaveBeenCalledWith({
            user: { client_user_id: 'user123' },
            client_name: 'Plaid Tutorial',
            language: 'en',
            products: ['transactions'],
            country_codes: ['US'],
            webhook: 'https://www.example.com/webhook',
        });
    });
});
