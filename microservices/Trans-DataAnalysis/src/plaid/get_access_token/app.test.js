// app.test.js

const AWS = require('aws-sdk');
const plaid = require('plaid');
const { getAccessTokenHandler } = require('./app'); // Adjust the path if necessary

jest.mock('aws-sdk');
jest.mock('plaid');

describe('getAccessTokenHandler', () => {
  const OLD_ENV = process.env;
  let mockDocumentClient;
  let mockPlaidApi;

  beforeEach(() => {
    jest.resetModules(); 
    process.env = { ...OLD_ENV, TABLE_NAME: 'TestTable', PLAID_CLIENT_ID: 'test_client_id', PLAID_SECRET: 'test_secret' };

    // Mock DynamoDB DocumentClient
    mockDocumentClient = {
      update: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    };
    AWS.DynamoDB.DocumentClient.mockImplementation(() => mockDocumentClient);

    // Mock Plaid API
    mockPlaidApi = {
      itemPublicTokenExchange: jest.fn(),
      accountsGet: jest.fn(),
      institutionsGetById: jest.fn(),
    };
    plaid.PlaidApi.mockImplementation(() => mockPlaidApi);
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore original environment
  });

  test('returns 400 if pk is missing in the request body', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
      }),
    };

    const response = await getAccessTokenHandler(event);

    expect(response.statusCode).toBe(400);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing user id (pk)' });
  });

  test('successfully exchanges public token, retrieves account, updates DynamoDB, and returns 200', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
        pk: 'user123',
      }),
    };

    // Mock Plaid API responses
    mockPlaidApi.itemPublicTokenExchange.mockResolvedValue({
      data: { access_token: 'access-token-123' },
    });
    mockPlaidApi.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: 'acc_123',
            balances: { current: 1000 },
            mask: '1234',
            name: 'Checking Account',
          },
        ],
      },
    });
    mockPlaidApi.institutionsGetById.mockResolvedValue({
      data: { institution: { logo: 'https://logo.url' } },
    });

    // Mock DynamoDB update response
    mockDocumentClient.promise.mockResolvedValue({
      Attributes: {
        accounts: [
          {
            Bank: 'Test Bank',
            Logo: 'https://logo.url',
            Balance: 1000,
            Mask: '1234',
            Name: 'Checking Account',
            accountID: 'acc_123',
            accessToken: 'access-token-123',
          },
        ],
      },
    });

    const response = await getAccessTokenHandler(event);

    // Assertions for Plaid API calls
    expect(mockPlaidApi.itemPublicTokenExchange).toHaveBeenCalledWith({ public_token: 'public-token' });
    expect(mockPlaidApi.accountsGet).toHaveBeenCalledWith({ access_token: 'access-token-123' });
    expect(mockPlaidApi.institutionsGetById).toHaveBeenCalledWith({
      institution_id: 'ins_123',
      country_codes: ['US'],
      options: { include_optional_metadata: true },
    });

    // Assertions for DynamoDB update
    expect(mockDocumentClient.update).toHaveBeenCalledWith({
      TableName: 'TestTable',
      Key: { pk: 'user123' },
      UpdateExpression: 'SET accounts = list_append(if_not_exists(accounts, :empty_list), :new_account)',
      ExpressionAttributeValues: {
        ':new_account': [
          {
            Bank: 'Test Bank',
            Logo: 'https://logo.url',
            Balance: 1000,
            Mask: '1234',
            Name: 'Checking Account',
            accountID: 'acc_123',
            accessToken: 'access-token-123',
          },
        ],
        ':empty_list': [],
      },
      ReturnValues: 'UPDATED_NEW',
    });
    expect(mockDocumentClient.promise).toHaveBeenCalled();

    // Assertions for response
    expect(response.statusCode).toBe(200);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(response.body)).toEqual({
      accessToken: 'access-token-123',
      accountID: 'acc_123',
    });
  });

  test('handles Plaid itemPublicTokenExchange failure and returns appropriate error', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'invalid-public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
        pk: 'user123',
      }),
    };

    // Mock Plaid API failure
    mockPlaidApi.itemPublicTokenExchange.mockRejectedValue(new Error('Invalid public token'));

    const response = await getAccessTokenHandler(event);

    // Assertions for Plaid API calls
    expect(mockPlaidApi.itemPublicTokenExchange).toHaveBeenCalledWith({ public_token: 'invalid-public-token' });
    expect(mockPlaidApi.accountsGet).not.toHaveBeenCalled();
    expect(mockPlaidApi.institutionsGetById).not.toHaveBeenCalled();

    // Assertions for response
    expect(response.statusCode).toBe(500);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid public token' });
  });

  test('handles Plaid API unauthorized error and returns 401', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
        pk: 'user123',
      }),
    };

    // Mock Plaid API unauthorized error
    const unauthorizedError = new Error('Unauthorized');
    mockPlaidApi.itemPublicTokenExchange.mockRejectedValue(unauthorizedError);

    const response = await getAccessTokenHandler(event);

    // Assertions for response
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: 'Unauthorized' });
  });

  test('handles DynamoDB update failure and returns 500', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
        pk: 'user123',
      }),
    };

    // Mock Plaid API responses
    mockPlaidApi.itemPublicTokenExchange.mockResolvedValue({
      data: { access_token: 'access-token-123' },
    });
    mockPlaidApi.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: 'acc_123',
            balances: { current: 1000 },
            mask: '1234',
            name: 'Checking Account',
          },
        ],
      },
    });
    mockPlaidApi.institutionsGetById.mockResolvedValue({
      data: { institution: { logo: 'https://logo.url' } },
    });

    // Mock DynamoDB update failure
    mockDocumentClient.promise.mockRejectedValue(new Error('DynamoDB update failed'));

    const response = await getAccessTokenHandler(event);

    // Assertions for response
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'DynamoDB update failed' });
  });

  test('handles missing request body gracefully', async () => {
    const event = {
      // No body
    };

    const response = await getAccessTokenHandler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toHaveProperty('error');
  });

  test('handles malformed JSON in request body', async () => {
    const event = {
      body: '{ invalidJson: true, }', // Malformed JSON
    };

    const response = await getAccessTokenHandler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toHaveProperty('error');
  });

  test('handles missing account data from Plaid and continues without logo', async () => {
    const event = {
      body: JSON.stringify({
        public_token: 'public-token',
        bank: 'Test Bank',
        id: 'ins_123',
        accounts: [],
        pk: 'user123',
      }),
    };

    // Mock Plaid API responses without logo
    mockPlaidApi.itemPublicTokenExchange.mockResolvedValue({
      data: { access_token: 'access-token-123' },
    });
    mockPlaidApi.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: 'acc_123',
            balances: { current: 1000 },
            mask: '1234',
            name: 'Checking Account',
          },
        ],
      },
    });
    // Mock institutionsGetById to throw an error (logo retrieval failure)
    mockPlaidApi.institutionsGetById.mockRejectedValue(new Error('Logo fetch failed'));

    // Mock DynamoDB update response
    mockDocumentClient.promise.mockResolvedValue({
      Attributes: {
        accounts: [
          {
            Bank: 'Test Bank',
            Logo: '',
            Balance: 1000,
            Mask: '1234',
            Name: 'Checking Account',
            accountID: 'acc_123',
            accessToken: 'access-token-123',
          },
        ],
      },
    });

    const response = await getAccessTokenHandler(event);

    // Assertions for Plaid API calls
    expect(mockPlaidApi.itemPublicTokenExchange).toHaveBeenCalledWith({ public_token: 'public-token' });
    expect(mockPlaidApi.accountsGet).toHaveBeenCalledWith({ access_token: 'access-token-123' });
    expect(mockPlaidApi.institutionsGetById).toHaveBeenCalledWith({
      institution_id: 'ins_123',
      country_codes: ['US'],
      options: { include_optional_metadata: true },
    });

    // Assertions for DynamoDB update
    expect(mockDocumentClient.update).toHaveBeenCalledWith({
      TableName: 'TestTable',
      Key: { pk: 'user123' },
      UpdateExpression: 'SET accounts = list_append(if_not_exists(accounts, :empty_list), :new_account)',
      ExpressionAttributeValues: {
        ':new_account': [
          {
            Bank: 'Test Bank',
            Logo: '',
            Balance: 1000,
            Mask: '1234',
            Name: 'Checking Account',
            accountID: 'acc_123',
            accessToken: 'access-token-123',
          },
        ],
        ':empty_list': [],
      },
      ReturnValues: 'UPDATED_NEW',
    });
    expect(mockDocumentClient.promise).toHaveBeenCalled();

    // Assertions for response
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      accessToken: 'access-token-123',
      accountID: 'acc_123',
    });
  });
});
