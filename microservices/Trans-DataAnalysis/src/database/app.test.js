jest.mock('plaid');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const plaid = require('plaid');
const { lambda_handler } = require('./app'); 

describe('Transactional-Analysis Microservice Tests', () => {
    beforeAll(() => {
        process.env.TABLE_NAME = 'test-profileData';
        process.env.PLAID_CLIENT_ID = 'test-client-id';
        process.env.PLAID_SECRET = 'test-secret';
    });

    afterEach(() => {
        AWSMock.restore('DynamoDB.DocumentClient');
        jest.clearAllMocks();
    });

    test('lambda_handler - success', async () => {
        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        // Mock Plaid API methods
        const mockAccessToken = 'access-token-123';
        const mockAccountId = 'account-id-456';

        // Mock PlaidApi
        const itemPublicTokenExchangeMock = jest.fn().mockResolvedValue({
            data: { access_token: mockAccessToken }
        });
        const accountsGetMock = jest.fn().mockResolvedValue({
            data: { accounts: [{ account_id: mockAccountId }] }
        });

        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: itemPublicTokenExchangeMock,
            accountsGet: accountsGetMock,
        }));

        const event = {
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'TestBank',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.accessToken).toBe(mockAccessToken);
        expect(responseBody.accounts).toBe(mockAccountId);

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        expect(itemPublicTokenExchangeMock).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });
        expect(accountsGetMock).toHaveBeenCalledWith({
            access_token: mockAccessToken
        });
    });

    test('lambda_handler - missing pk', async () => {
        const event = {
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'TestBank'
                // 'pk' is missing
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Missing user id (pk)' });

    });

    test('lambda_handler - Plaid API error', async () => {
        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        // Mock PlaidApi to throw an error
        const itemPublicTokenExchangeMock = jest.fn().mockRejectedValue(new Error('Plaid API Error'));
        const accountsGetMock = jest.fn();

        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: itemPublicTokenExchangeMock,
            accountsGet: accountsGetMock,
        }));

        const event = {
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'TestBank',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: "ERROR" });

        // Verify that PlaidApi methods were called correctly
        // expect(plaidApiMock).toHaveBeenCalledTimes(1);
        // const plaidInstance = plaidApiMock.mock.results[0].value;
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        expect(itemPublicTokenExchangeMock).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });
        // accountsGet should not be called due to error in itemPublicTokenExchange
        expect(accountsGetMock).not.toHaveBeenCalled();
    });

    test('lambda_handler - DynamoDB error', async () => {
        // Mock DynamoDB put to throw an error
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(new Error('DynamoDB Error'), null);
        });

        // Mock PlaidApi methods
        const mockAccessToken = 'access-token-123';
        const mockAccountId = 'account-id-456';

        const itemPublicTokenExchangeMock = jest.fn().mockResolvedValue({
            data: { access_token: mockAccessToken }
        });
        const accountsGetMock = jest.fn().mockResolvedValue({
            data: { accounts: [{ account_id: mockAccountId }] }
        });

        plaid.PlaidApi.mockImplementation(() => ({
            itemPublicTokenExchange: itemPublicTokenExchangeMock,
            accountsGet: accountsGetMock,
        }));

        const event = {
            body: JSON.stringify({
                public_token: 'public-token-789',
                bank: 'TestBank',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: "ERROR" });

        // Verify that PlaidApi methods were called correctly
        // expect(plaidApiMock).toHaveBeenCalledTimes(1);
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        // const plaidInstance = plaidApiMock.mock.results[0].value;
        expect(itemPublicTokenExchangeMock).toHaveBeenCalledWith({
            public_token: 'public-token-789'
        });
        expect(accountsGetMock).toHaveBeenCalledWith({
            access_token: mockAccessToken
        });
    });
});
