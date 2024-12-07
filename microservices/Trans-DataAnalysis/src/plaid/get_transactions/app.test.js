jest.mock('plaid', () => {
  return {
    PlaidEnvironments: {
      sandbox: 'sandbox',
    },
    Configuration: jest.fn().mockImplementation(() => ({})),
    PlaidApi: jest.fn(),
  };
});

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(),
    },
  };
});

describe('getTransactionsHandler', () => {
  const OLD_ENV = { ...process.env };

  let mockDynamoDB;
  let mockPlaidApi;
  let getTransactionsHandler;

  beforeEach(() => {
    jest.resetModules(); // clear module cache

    // Set environment variables before requiring app.js
    process.env = {
      ...OLD_ENV,
      TABLE_NAME: 'TestTable',
      PLAID_CLIENT_ID: 'test_client_id',
      PLAID_SECRET: 'test_secret',
    };

    const AWS = require('aws-sdk');
    const plaid = require('plaid');

    // Setup DynamoDB mock
    mockDynamoDB = {
      put: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    };
    AWS.DynamoDB.DocumentClient.mockImplementation(() => mockDynamoDB);

    // Setup PlaidApi mock
    mockPlaidApi = {
      transactionsGet: jest.fn(),
    };
    require('plaid').PlaidApi.mockImplementation(() => mockPlaidApi);

    // Now require app.js after the mocks and env are ready
    ({ getTransactionsHandler } = require('./app'));
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore original environment
  });

  test('returns 500 if TABLE_NAME environment variable is missing', async () => {
    delete process.env.TABLE_NAME;

    jest.resetModules();
    ({ getTransactionsHandler } = require('./app'));

    const event = {
      body: JSON.stringify({
        accessToken: 'access-token-123',
        pk: 'user123',
      }),
    };

    const response = await getTransactionsHandler(event);

    expect(response.statusCode).toBe(500);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(response.body)).toEqual({ error: 'Internal server error.' });
  });

  test('returns 400 if request body contains invalid JSON', async () => {
    const event = {
      body: '{ invalidJson: true, }',
    };

    const response = await getTransactionsHandler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid JSON format in request body.' });
  });

  test('returns 400 if accessToken or pk is missing in the request body', async () => {
    // Missing accessToken
    const eventMissingAccessToken = {
      body: JSON.stringify({ pk: 'user123' }),
    };
    let response = await getTransactionsHandler(eventMissingAccessToken);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing accessToken or userId (pk).' });

    // Missing pk
    const eventMissingPk = {
      body: JSON.stringify({ accessToken: 'access-token-123' }),
    };
    response = await getTransactionsHandler(eventMissingPk);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing accessToken or userId (pk).' });
  });

  test('successfully fetches transactions, deduplicates, stores in DynamoDB, returns 200', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    const mockTransactions = [
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      {
        transaction_id: 'txn_2',
        date: '2024-02-20',
        account_id: 'acc_2',
        amount: 150.0,
        name: 'Electronics Store',
      },
      // Duplicate of txn_1 (should be skipped)
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      // Transaction missing account_id (invalid, should be skipped)
      {
        date: '2024-03-10',
        account_id: 'acc_3',
        amount: 75.0,
        name: 'Restaurant',
      },
      // Transaction missing date (invalid, should be skipped)
      {
        transaction_id: 'txn_4',
        account_id: 'acc_4',
        amount: 200.0,
        name: 'Online Subscription',
      },
    ];

    mockPlaidApi.transactionsGet.mockResolvedValue({
      data: {
        transactions: mockTransactions,
      },
    });

    mockDynamoDB.promise.mockResolvedValueOnce({}).mockResolvedValueOnce({});

    const response = await getTransactionsHandler(event);

    expect(mockPlaidApi.transactionsGet).toHaveBeenCalledWith({
      access_token: 'access-token-123',
      start_date: '2024-01-01',
      end_date: '2024-11-01',
    });

    const expectedUniqueTransactions = [
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      {
        transaction_id: 'txn_2',
        date: '2024-02-20',
        account_id: 'acc_2',
        amount: 150.0,
        name: 'Electronics Store',
      },
      {
        date: '2024-03-10',
        account_id: 'acc_3',
        amount: 75.0,
        name: 'Restaurant',
      },
      {
        transaction_id: 'txn_4',
        account_id: 'acc_4',
        amount: 200.0,
        name: 'Online Subscription',
      },
    ];

    expect(mockDynamoDB.put).toHaveBeenCalledTimes(2);
    expect(mockDynamoDB.put).toHaveBeenCalledWith({
      TableName: 'TestTable',
      Item: {
        pk: 'user123',
        sk: '2024-01-15#t-txn_1',
        amount: 50.0,
        expenseName: 'Grocery Store',
        accountId: 'acc_1',
      },
    });
    expect(mockDynamoDB.put).toHaveBeenCalledWith({
      TableName: 'TestTable',
      Item: {
        pk: 'user123',
        sk: '2024-02-20#t-txn_2',
        amount: 150.0,
        expenseName: 'Electronics Store',
        accountId: 'acc_2',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transactions stored successfully',
      data: expectedUniqueTransactions,
    });
  });

  test('returns 502 if fetching transactions from Plaid fails', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    mockPlaidApi.transactionsGet.mockRejectedValue(new Error('Plaid API Error'));

    const response = await getTransactionsHandler(event);

    expect(mockPlaidApi.transactionsGet).toHaveBeenCalledWith({
      access_token: 'access-token-123',
      start_date: '2024-01-01',
      end_date: '2024-11-01',
    });
    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'Failed to fetch transactions from Plaid.' });
    expect(mockDynamoDB.put).not.toHaveBeenCalled();
  });

  test('handles DynamoDB put failure for individual transactions and continues', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    const mockTransactions = [
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      {
        transaction_id: 'txn_2',
        date: '2024-02-20',
        account_id: 'acc_2',
        amount: 150.0,
        name: 'Electronics Store',
      },
    ];

    mockPlaidApi.transactionsGet.mockResolvedValue({ data: { transactions: mockTransactions } });

    mockDynamoDB.promise
      .mockResolvedValueOnce({}) // txn_1 success
      .mockRejectedValueOnce(new Error('DynamoDB Put Error')); // txn_2 fails

    const response = await getTransactionsHandler(event);

    expect(mockDynamoDB.put).toHaveBeenCalledTimes(2);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transactions stored successfully',
      data: mockTransactions, // Here, the code still returns all fetched transactions even if one fails
    });
  });

  test('returns 200 message when no transactions found', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    mockPlaidApi.transactionsGet.mockResolvedValue({ data: { transactions: [] } });

    const response = await getTransactionsHandler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'No transactions found for the specified date range.',
    });
    expect(mockDynamoDB.put).not.toHaveBeenCalled();
  });

  test('returns 200 when all transactions are duplicates', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    const mockTransactions = [
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      {
        transaction_id: 'txn_1', // duplicate
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
    ];

    mockPlaidApi.transactionsGet.mockResolvedValue({ data: { transactions: mockTransactions } });
    mockDynamoDB.promise.mockResolvedValue({});

    const response = await getTransactionsHandler(event);

    // After deduplication, only one txn_1 remains
    const expectedUniqueTransactions = [
      {
        transaction_id: 'txn_1',
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
    ];

    expect(mockDynamoDB.put).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transactions stored successfully',
      data: expectedUniqueTransactions,
    });
  });

  test('handles transactions missing fields and skips them', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'access-token-123', pk: 'user123' }),
    };

    const mockTransactions = [
      // Missing transaction_id
      { date: '2024-01-15', account_id: 'acc_1', amount: 50.0, name: 'Grocery Store' },
      // Missing date
      { transaction_id: 'txn_2', account_id: 'acc_2', amount: 150.0, name: 'Electronics Store' },
      // Missing account_id
      { transaction_id: 'txn_3', date: '2024-03-10', amount: 75.0, name: 'Restaurant' },
      // Valid transaction
      {
        transaction_id: 'txn_4',
        date: '2024-04-05',
        account_id: 'acc_4',
        amount: 200.0,
        name: 'Online Subscription',
      },
    ];

    mockPlaidApi.transactionsGet.mockResolvedValue({ data: { transactions: mockTransactions } });
    mockDynamoDB.promise.mockResolvedValue({});

    const response = await getTransactionsHandler(event);

    const expectedUniqueTransactions = [
      {
        date: '2024-01-15',
        account_id: 'acc_1',
        amount: 50.0,
        name: 'Grocery Store',
      },
      {
        transaction_id: 'txn_2',
        account_id: 'acc_2',
        amount: 150.0,
        name: 'Electronics Store',
      },
      {
        date: '2024-03-10',
        amount: 75.0,
        name: 'Restaurant',
        transaction_id: "txn_3",
      },
      {
        date: "2024-04-05",
        transaction_id: 'txn_4',
        account_id: 'acc_4',
        amount: 200.0,
        name: 'Online Subscription',
      },
    ];

    expect(mockDynamoDB.put).toHaveBeenCalledTimes(1);
    expect(mockDynamoDB.put).toHaveBeenCalledWith({
      TableName: 'TestTable',
      Item: {
        pk: 'user123',
        sk: '2024-04-05#t-txn_4',
        amount: 200.0,
        expenseName: 'Online Subscription',
        accountId: 'acc_4',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transactions stored successfully',
      data: expectedUniqueTransactions,
    });
  });
});
