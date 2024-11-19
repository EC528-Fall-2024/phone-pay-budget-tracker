const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
require('dotenv').config({ path: '../../../../../PhonePayBudgetTracker/.env' });

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
    console.error('Token validation failed:', error);
    throw new Error('Unauthorized');
  }
};

// Function to create the DynamoDB connection
const getDBConnection = () => {
  console.log('DynamoDB creating connection');

  const config = {
    apiVersion: '2012-08-10',
    region: 'us-east-2',
    endpoint: 'http://host.docker.internal:8000', // Local DynamoDB (if applicable)
    credentials: {
      accessKeyId: 'Secret',
      secretAccessKey: 'Secret',
    },
    maxAttempts: 2,
    requestHandler: new NodeHttpHandler({
      socketTimeout: 1000,
      connectionTimeout: 1000,
    }),
  };

  return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};

const dynamodb = getDBConnection(); // Initialize the DynamoDB client

// Plaid client configuration
const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox, // Use sandbox environment for testing
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': "67059ac70f3934001bb637ab",
      'PLAID-SECRET': "6480180b111c6e48efe009f6d5d568",
    },
  },
});
const client = new plaid.PlaidApi(configuration);

// Lambda handler to fetch transactions from Plaid and store them in DynamoDB
exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await validateToken(token);

    // Parse request body
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken;
    const userId = body.pk; // The primary key for the user

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user ID (pk)' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Fetch transactions from Plaid
    const request = {
      access_token: accessToken,
      start_date: '2024-01-01',
      end_date: '2024-11-01',
    };

    const transactionsResponse = await client.transactionsGet(request);
    const transactions = transactionsResponse.data.transactions;

    // Store each transaction in DynamoDB
    const putPromises = transactions.map(async (transaction, index) => {
      const params = {
        TableName: 'transactionData',
        Item: {
          pk: userId, // User ID as the partition key
          sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`, // Unique sort key per transaction
          amount: transaction.amount,
          expenseName: transaction.name || 'Unknown',
        },
      };
      await dynamodb.send(new PutCommand(params));
    });

    // Wait for all transactions to be stored
    await Promise.all(putPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Transactions stored successfully',
        data: transactionsResponse.data.transactions,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error occurred:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store transactions', message: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
