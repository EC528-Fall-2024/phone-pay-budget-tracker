jest.mock('plaid');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const plaid = require('plaid');
const { lambda_handler } = require('./app');

describe('Get Transactions Microservice Tests', () => {
    beforeAll(() => {
        process.env.PLAID_CLIENT_ID = 'test-client-id';
        process.env.PLAID_SECRET = 'test-secret';
        process.env.TABLE_NAME = 'test-transactionData';
        //AWS.config.update({ region: 'us-east-2' });
    });

    afterEach(() => {
        // Restore AWS SDK mocks and clear Jest mocks after each test
        AWSMock.restore('DynamoDB.DocumentClient');
        jest.clearAllMocks();
    });

    test('lambda_handler - success', async () => {
        // Mock PlaidApi methods
        const mockTransactions = [
            {
                date: '2024-10-01',
                amount: 50.25,
                name: 'Coffee Shop',
                account_id: 'acc123',
            },
            {
                date: '2024-10-02',
                amount: 20.00,
                name: 'Grocery Store',
                account_id: 'acc123',
            }
        ];

        plaid.PlaidApi.mockImplementation(() => ({
            transactionsGet: jest.fn().mockResolvedValue({
                data: { transactions: mockTransactions }
            })
        }));

        // Create a mock function for DynamoDB.put
        const putMock = jest.fn((params, callback) => {
            callback(null, {}); // Simulate successful put
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                accessToken: 'access-token-123',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({
            message: 'Transactions stored successfully',
            data: mockTransactions,
        });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsGet).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
        });

        // Verify that DynamoDB put was called for each transaction
        expect(putMock).toHaveBeenCalledTimes(mockTransactions.length);
        mockTransactions.forEach((transaction, index) => {
            expect(putMock).toHaveBeenCalledWith({
                TableName: 'test-transactionData', // From process.env.TABLE_NAME
                Item: {
                    pk: 'user123',
                    sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`,
                    amount: transaction.amount,
                    expenseName: transaction.name || 'Unknown',
                },
            }, expect.any(Function));
        });
    });

    test('lambda_handler - missing accessToken or userId', async () => {
        const eventMissingAccessToken = {
            body: JSON.stringify({
                // accessToken is missing
                pk: 'user123'
            })
        };

        const eventMissingUserId = {
            body: JSON.stringify({
                accessToken: 'access-token-123',
                // pk is missing
            })
        };

        // Test missing accessToken
        const responseMissingAccessToken = await lambda_handler(eventMissingAccessToken);
        expect(responseMissingAccessToken.statusCode).toBe(400);
        const responseBodyMissingAccessToken = JSON.parse(responseMissingAccessToken.body);
        expect(responseBodyMissingAccessToken).toEqual({ error: 'Missing accessToken or userId' });

        // Verify that PlaidApi was not called
        expect(plaid.PlaidApi).not.toHaveBeenCalled();

        // Verify that DynamoDB put was not called
        const putMock = jest.fn();
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);
        expect(putMock).not.toHaveBeenCalled();

        // Test missing userId
        const responseMissingUserId = await lambda_handler(eventMissingUserId);
        expect(responseMissingUserId.statusCode).toBe(400);
        const responseBodyMissingUserId = JSON.parse(responseMissingUserId.body);
        expect(responseBodyMissingUserId).toEqual({ error: 'Missing accessToken or userId' });

        // Verify that PlaidApi was not called
        expect(plaid.PlaidApi).not.toHaveBeenCalled();

        // Verify that DynamoDB put was not called
        expect(putMock).not.toHaveBeenCalled();
    });

    test('lambda_handler - Plaid API error', async () => {
        // Mock PlaidApi to throw an error
        plaid.PlaidApi.mockImplementation(() => ({
            transactionsGet: jest.fn().mockRejectedValue(new Error('Plaid API Error'))
        }));

        // Create a mock function for DynamoDB.put to track if it's called
        const putMock = jest.fn();

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                accessToken: 'access-token-123',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Failed to store transactions', message: 'Plaid API Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsGet).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
        });

        // Ensure no DynamoDB puts were attempted
        expect(putMock).not.toHaveBeenCalled();
    });

    test('lambda_handler - DynamoDB put error', async () => {
        // Mock PlaidApi methods
        const mockTransactions = [
            {
                date: '2024-10-01',
                amount: 50.25,
                name: 'Coffee Shop',
                account_id: 'acc123',
            }
        ];

        plaid.PlaidApi.mockImplementation(() => ({
            transactionsGet: jest.fn().mockResolvedValue({
                data: { transactions: mockTransactions }
            })
        }));

        // Create a mock function for DynamoDB.put that simulates an error
        const putMock = jest.fn((params, callback) => {
            callback(new Error('DynamoDB Error'), null); // Simulate DynamoDB put error
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                accessToken: 'access-token-123',
                pk: 'user123'
            })
        };

        const response = await lambda_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Failed to store transactions', message: 'DynamoDB Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsGet).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
        });

        // Verify that DynamoDB put was called once
        expect(putMock).toHaveBeenCalledTimes(mockTransactions.length);
        expect(putMock).toHaveBeenCalledWith({
            TableName: 'test-transactionData',
            Item: {
                pk: 'user123',
                sk: '2024-10-01#t-000',
                amount: 50.25,
                expenseName: 'Coffee Shop'
            },
        }, expect.any(Function));
    });
});
