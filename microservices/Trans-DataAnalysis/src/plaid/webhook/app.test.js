jest.mock('plaid');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const plaid = require('plaid');
const { webhook_handler } = require('./app'); 

describe('Webhook Microservice Tests', () => {
    beforeAll(() => {
        process.env.PLAID_CLIENT_ID = 'test-client-id';
        process.env.PLAID_SECRET = 'test-secret';
        process.env.TABLE_NAME = 'test-transactionData';
    });

    afterEach(() => {
        AWSMock.restore('DynamoDB.DocumentClient');
        jest.clearAllMocks();
    });

    test('webhook_handler - success', async () => {
        // Mock PlaidApi methods
        const mockAddedTransactions = [
            {
                date: '2024-10-03',
                amount: 75.00,
                name: 'Restaurant',
                account_id: 'acc789',
            }
        ];

        plaid.PlaidApi.mockImplementation(() => ({
            transactionsSync: jest.fn().mockResolvedValue({
                data: { added: mockAddedTransactions }
            })
        }));

        // Create a mock function for DynamoDB.put
        const putMock = jest.fn((params, callback) => {
            callback(null, {}); 
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                webhook_code: 'TRANSACTIONS_UPDATED',
                accessToken: 'access-token-123',
                account_ids: ['acc789']
            })
        };

        const response = await webhook_handler(event);

        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ message: 'Transactions updated successfully' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsSync).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
            options: {
                account_ids: ['acc789']
            },
        });

        // Verify that DynamoDB put was called for each transaction
        expect(putMock).toHaveBeenCalledTimes(mockAddedTransactions.length);
    });

    test('webhook_handler - non-transaction update webhook', async () => {
        const event = {
            body: JSON.stringify({
                webhook_code: 'ITEM_WEBHOOK_UPDATE',
                accessToken: 'access-token-123',
                account_ids: ['acc789']
            })
        };

        const response = await webhook_handler(event);

        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ message: 'Webhook received' });

        // Verify that PlaidApi was not called
        expect(plaid.PlaidApi).not.toHaveBeenCalled();
    });

    test('webhook_handler - Plaid API error', async () => {
        // Mock PlaidApi to throw an error
        plaid.PlaidApi.mockImplementation(() => ({
            transactionsSync: jest.fn().mockRejectedValue(new Error('Plaid API Error'))
        }));

        // Create a mock function for DynamoDB.put to track if it's called
        const putMock = jest.fn();

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                webhook_code: 'TRANSACTIONS_UPDATED',
                accessToken: 'access-token-123',
                account_ids: ['acc789']
            })
        };

        const response = await webhook_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Failed to update transactions', message: 'Plaid API Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsSync).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
            options: {
                account_ids: ['acc789']
            },
        });

        // Ensure no DynamoDB puts were attempted
        expect(putMock).not.toHaveBeenCalled();
    });

    test('webhook_handler - DynamoDB error', async () => {
        // Mock PlaidApi methods
        const mockAddedTransactions = [
            {
                date: '2024-10-04',
                amount: 100.00,
                name: 'Online Store',
                account_id: 'acc789',
            }
        ];

        plaid.PlaidApi.mockImplementation(() => ({
            transactionsSync: jest.fn().mockResolvedValue({
                data: { added: mockAddedTransactions }
            })
        }));

        // Create a mock function for DynamoDB.put that simulates an error
        const putMock = jest.fn((params, callback) => {
            callback(new Error('DynamoDB Error'), null); // Simulate DynamoDB error
        });

        // Mock DynamoDB put
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', putMock);

        const event = {
            body: JSON.stringify({
                webhook_code: 'TRANSACTIONS_UPDATED',
                accessToken: 'access-token-123',
                account_ids: ['acc789']
            })
        };

        const response = await webhook_handler(event);

        expect(response.statusCode).toBe(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ error: 'Failed to update transactions', message: 'DynamoDB Error' });

        // Verify that PlaidApi methods were called correctly
        expect(plaid.PlaidApi).toHaveBeenCalledTimes(1);
        const plaidInstance = plaid.PlaidApi.mock.results[0].value;
        expect(plaidInstance.transactionsSync).toHaveBeenCalledWith({
            access_token: 'access-token-123',
            start_date: '2024-01-01',
            end_date: '2024-11-01',
            options: {
                account_ids: ['acc789']
            },
        });

        // Verify that DynamoDB put was called for each transaction
        expect(putMock).toHaveBeenCalledTimes(mockAddedTransactions.length);
    });
});
