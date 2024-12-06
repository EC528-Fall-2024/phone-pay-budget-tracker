const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const AWS = require('aws-sdk');

// Cognito setup
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;

// Function to validate the Cognito token
const validateToken = async (token) => {
  try {
    // Fetch Cognito's JWKS (JSON Web Key Set)
    const { data: jwks } = await axios.get(`${cognitoIssuer}/.well-known/jwks.json`);
    const { header } = jwt.decode(token, { complete: true });
    const jwk = jwks.keys.find((key) => key.kid === header.kid);
    if (!jwk) throw new Error('Invalid token');

    // Convert JWK to PEM
    const pem = jwkToPem(jwk);

    // Verify the token
    return jwt.verify(token, pem, { issuer: cognitoIssuer });
  } catch (error) {
    console.error('Token validation failed:', error.message);
    throw new Error('Unauthorized');
  }
};

exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers?.Authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing Authorization token' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const decodedToken = await validateToken(token);

    // Use the `sub` as the unique user identifier
    const userSub = decodedToken.sub;

    const body = JSON.parse(event.body);
    const { accessToken } = body;

    if (!accessToken) {
      return {
        statusCode: 400, // Bad request if missing parameters
        body: JSON.stringify({ error: 'Missing accessToken' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const tableName = process.env.TABLE_NAME;
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Initialize the Plaid client
    const configuration = new plaid.Configuration({
      basePath: plaid.PlaidEnvironments.sandbox, // Use sandbox environment for testing
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });
    const client = new plaid.PlaidApi(configuration);

    const request = {
      access_token: accessToken,
      start_date: '2024-01-01',
      end_date: '2024-11-01',
    };

    // Fetch transactions in the sandbox environment
    const transactionsResponse = await client.transactionsGet(request);
    const transactions = transactionsResponse.data.transactions;

    // Store transactions in DynamoDB
    const putPromises = transactions.map(async (transaction, index) => {
      const params = {
        TableName: tableName,
        Item: {
          pk: userSub, // Securely associate with authenticated user
          sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`, // Unique sort key per transaction
          amount: transaction.amount,
          expenseName: transaction.name || 'Unknown',
        },
      };
      await dynamodb.put(params).promise();
    });

    // Wait for all put operations to complete
    await Promise.all(putPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Transactions stored successfully',
        data: transactions,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error occurred:', error.message);
    const statusCode = error.message === 'Unauthorized' ? 401 : 500;
    return {
      statusCode: statusCode,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};