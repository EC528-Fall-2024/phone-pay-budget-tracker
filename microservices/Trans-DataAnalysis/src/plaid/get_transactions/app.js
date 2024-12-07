const plaid = require('plaid');
const AWS = require('aws-sdk');

// Common CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Adjust for security if needed
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed HTTP methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed headers
};

// Initialize Plaid and DynamoDB clients outside the handler for connection reuse
const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox, // Use sandbox for testing
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const client = new plaid.PlaidApi(configuration);
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.getTransactionsHandler = async (event) => {
  const startTime = Date.now(); // Track execution time

  try {
    const tableName = process.env.TABLE_NAME;
    if (!tableName) {
      console.error('TABLE_NAME environment variable is not set.');
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error.' }),
      };
    }

    // Parse and validate the incoming request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Failed to parse event body:', parseError);
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON format in request body.' }),
      };
    }

    const accessToken = body.accessToken;
    const userId = body.pk; // The primary key for the user

    // Input validation
    if (!accessToken || !userId) {
      console.warn('Missing accessToken or userId (pk).');
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing accessToken or userId (pk).' }),
      };
    }

    console.log(`Processing transactions for userId: ${userId} with accessToken: ${accessToken}`);

    const request = {
      access_token: accessToken,
      start_date: "2024-01-01",
      end_date: "2024-11-01",
    };

    // Fetch transactions from Plaid
    let transactionsResponse;
    try {
      transactionsResponse = await client.transactionsGet(request);
      console.log('Successfully fetched transactions from Plaid.');
    } catch (plaidError) {
      console.error('Error fetching transactions from Plaid:', plaidError);
      return {
        statusCode: 502, // Bad Gateway
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch transactions from Plaid.' }),
      };
    }

    let transactions = transactionsResponse.data.transactions;

    console.log(`Fetched ${transactions.length} transactions from Plaid.`);

    if (!transactions || transactions.length === 0) {
      console.info('No transactions found for the specified date range.');
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'No transactions found for the specified date range.',
        }),
      };
    }

    // Deduplicate transactions based on transaction_id to prevent overwriting
    const uniqueTransactionsMap = new Map();
    transactions.forEach((transaction, index) => {
      let uniqueId = transaction.transaction_id;
      if (!uniqueId) {
        // Generate a unique identifier if transaction_id is missing
        uniqueId = `no-id-${index}-${Date.now()}`;
        console.warn(`Transaction at index ${index} missing transaction_id. Generated uniqueId: ${uniqueId}`);
      }

      if (!uniqueTransactionsMap.has(uniqueId)) {
        uniqueTransactionsMap.set(uniqueId, transaction);
      } else {
        console.warn(`Duplicate transaction detected and skipped: ${uniqueId}`);
      }
    });

    const uniqueTransactions = Array.from(uniqueTransactionsMap.values());
    console.log(`After deduplication, ${uniqueTransactions.length} unique transactions remain.`);

    if (uniqueTransactions.length === 0) {
      console.info('All fetched transactions were duplicates and have been skipped.');
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'All fetched transactions were duplicates and have been skipped.',
        }),
      };
    }

    // Iterate over each transaction and store it in DynamoDB sequentially
    let storedCount = 0;
    for (const [index, transaction] of uniqueTransactions.entries()) {
      // Validate required attributes
      if (!transaction.transaction_id) {
        console.warn(`Skipping transaction at index ${index} due to missing transaction_id.`);
        continue; // Skip this transaction
      }

      if (!transaction.date || !transaction.account_id) {
        console.warn(`Skipping transaction at index ${index} due to missing date or account_id.`);
        continue; // Skip this transaction
      }

      const params = {
        TableName: tableName, // Use the environment variable
        Item: {
          pk: userId, 
          sk: `${transaction.date}#t-${transaction.transaction_id}`, // Unique Sort Key using transaction_id
          amount: transaction.amount,
          expenseName: transaction.name || "Unknown",
          accountId: transaction.account_id, // Associate the transaction with its account ID
        },
      };

      try {
        console.log(`Putting transaction ${index + 1}/${uniqueTransactions.length}: ${transaction.transaction_id}`);
        await dynamodb.put(params).promise();
        console.log(`Successfully stored transaction ${index + 1}/${uniqueTransactions.length}: ${transaction.transaction_id}`);
        storedCount++;
      } catch (dynamoError) {
        console.error(`Error storing transaction ${transaction.transaction_id}:`, dynamoError);
        // Continue storing other transactions even if one fails
      }
    }

    console.log(`Stored ${storedCount}/${uniqueTransactions.length} transactions successfully.`);
    console.log('All transactions have been stored successfully.');

    const endTime = Date.now();
    console.log(`Function executed successfully in ${(endTime - startTime) / 1000} seconds.`);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Transactions stored successfully',
        data: uniqueTransactions,
      }),
    };
  } catch (error) {
    const endTime = Date.now();
    console.error(`Function failed after ${(endTime - startTime) / 1000} seconds with error:`, error);

    // Determine appropriate status code based on error type
    let statusCode = 500; // Default to Internal Server Error
    if (error.code === 'AccessDeniedException') {
      statusCode = 403; // Forbidden
    } else if (error.code === 'ValidationException') {
      statusCode = 400; // Bad Request
    } else if (error.statusCode) {
      statusCode = error.statusCode; // Use error's statusCode if available
    }

    return {
      statusCode: statusCode,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};


