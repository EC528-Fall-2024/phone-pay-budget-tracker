jest.mock('plaid');
jest.mock('axios');
jest.mock('jsonwebtoken');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const plaid = require('plaid');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { lambda_handler } = require('./app'); 

describe('Get Access Token Microservice Tests', () => {
    beforeAll(() => {
        // Set environment variables required by the Lambda function
        process.env.PLAID_CLIENT_ID = 'test-client-id';
        process.env.PLAID_SECRET = 'test-secret';
        process.env.TABLE_NAME = 'test-transactionData'; 
        process.env.AWS_REGION = 'us-east-2';
        process.env.USER_POOL_ID = 'us-east-2_example'; 
    });

    afterEach(() => {
        // Restore AWS SDK mocks and clear Jest mocks after each test
        AWSMock.restore('DynamoDB.DocumentClient');
        jest.clearAllMocks();
    });

    test('lambda_handler - success', async () => {
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

        // Mock PlaidApi methods
        const mockAccessToken = 'access-token-123';
        const mockAccountId = 'account-id-456';
        const mockLogoUrl = 'https://example.com/logo.png';

        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: jest.fn().mockResolvedValue({
                data: { access_token: mockAccessToken }
            }),
            accountsGet: jest.fn().mockResolvedValue({
                data: { accounts: [{
                    account_id: mockAccountId,
                    balances: { current: 1000 },
                    mask: '1234',
                    name: 'Test Checking'
                }] }
            }),
            institutionsGetById: jest.fn().mockResolvedValue({
                data: { institution: { logo: mockLogoUrl } }
            })
        }));

        // Create a mock function for DynamoDB.put
        const putMock = jest.fn((params, callback) => {
            callback(null, {}); // Simulate successful put
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        // Create a mock event with Authorization header
        const event = {
            headers: {
                Authorization: 'Bearer valid-token'
            },
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'Test Bank',
                id: 'ins_12345',
                accounts: [],
                pk: 'user123'
            })
        };

        // Invoke the Lambda handler
        const response = await lambda_handler(event);

        // Assertions
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({
            accessToken: mockAccessToken,
            accounts: mockAccountId
        });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.itemPublicTokenExchange).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });
        expect(plaidInstance.accountsGet).toHaveBeenCalledWith({
            access_token: mockAccessToken
        });
        expect(plaidInstance.institutionsGetById).toHaveBeenCalledWith({
            institution_id: 'ins_12345',
            country_codes: ['US'],
            options: {
                include_optional_metadata: true,
            }
        });

        // Verify that DynamoDB put was called once with correct parameters
        expect(putMock).toHaveBeenCalledTimes(1);
        expect(putMock).toHaveBeenCalledWith({
            TableName: 'test-transactionData', // From process.env.TABLE_NAME
            Item: {
                pk: 'user123',
                accounts: [{
                    Bank: 'Test Bank',
                    Logo: mockLogoUrl,
                    Balance: 1000,
                    Mask: '1234',
                    Name: 'Test Checking',
                    accountID: mockAccountId,
                    accessToken: mockAccessToken
                }],
                email: 'bmahoney132@gmail.com',
                profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
            },
        }, expect.any(Function));
    });

    test('lambda_handler - missing user id (pk)', async () => {
        const event = {
            headers: {
                Authorization: 'Bearer valid-token'
            },
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'Test Bank',
                id: 'ins_12345',
                accounts: []
                // pk is missing
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Missing user id (pk)' });

        // Verify that PlaidApi was not called
        expect(plaid.PlaidApi).not.toHaveBeenCalled();

        // Verify that DynamoDB put was not called
        const putMock = jest.fn();
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);
        expect(putMock).not.toHaveBeenCalled();
    });

    test('lambda_handler - Plaid API error during itemPublicTokenExchange', async () => {
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

        // Mock PlaidApi to throw an error on itemPublicTokenExchange
        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: jest.fn().mockRejectedValue(new Error('Plaid API Error'))
        }));

        // Create a mock function for DynamoDB.put
        const putMock = jest.fn();

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        // Create a mock event with Authorization header
        const event = {
            headers: {
                Authorization: 'Bearer valid-token'
            },
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'Test Bank',
                id: 'ins_12345',
                accounts: [],
                pk: 'user123'
            })
        };

        // Invoke the Lambda handler
        const response = await lambda_handler(event);

        // Assertions
        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Plaid API Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.itemPublicTokenExchange).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });

        // Ensure DynamoDB put was not called
        expect(putMock).not.toHaveBeenCalled();
    });

    test('lambda_handler - DynamoDB put error', async () => {
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

        // Mock PlaidApi methods
        const mockAccessToken = 'access-token-123';
        const mockAccountId = 'account-id-456';
        const mockLogoUrl = 'https://example.com/logo.png';

        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: jest.fn().mockResolvedValue({
                data: { access_token: mockAccessToken }
            }),
            accountsGet: jest.fn().mockResolvedValue({
                data: { accounts: [{
                    account_id: mockAccountId,
                    balances: { current: 1000 },
                    mask: '1234',
                    name: 'Test Checking'
                }] }
            }),
            institutionsGetById: jest.fn().mockResolvedValue({
                data: { institution: { logo: mockLogoUrl } }
            })
        }));

        // Create a mock function for DynamoDB.put that simulates an error
        const putMock = jest.fn((params, callback) => {
            callback(new Error('DynamoDB Error'), null); // Simulate DynamoDB put error
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        // Create a mock event with Authorization header
        const event = {
            headers: {
                Authorization: 'Bearer valid-token'
            },
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'Test Bank',
                id: 'ins_12345',
                accounts: [],
                pk: 'user123'
            })
        };

        // Invoke the Lambda handler
        const response = await lambda_handler(event);

        // Assertions
        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'DynamoDB Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.itemPublicTokenExchange).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });
        expect(plaidInstance.accountsGet).toHaveBeenCalledWith({
            access_token: mockAccessToken
        });
        expect(plaidInstance.institutionsGetById).toHaveBeenCalledWith({
            institution_id: 'ins_12345',
            country_codes: ['US'],
            options: {
                include_optional_metadata: true,
            }
        });

        // Verify that DynamoDB put was called once
        expect(putMock).toHaveBeenCalledTimes(1);
    });
});
