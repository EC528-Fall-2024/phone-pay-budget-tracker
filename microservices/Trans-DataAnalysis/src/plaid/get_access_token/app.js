require('dotenv').config({ path: '../../../../../PhonePayBudgetTracker/.env' });
const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
const https = require('https');

// Cognito setup
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;

// Initialize the Plaid client
const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': "67059ac70f3934001bb637ab",
      'PLAID-SECRET': "6480180b111c6e48efe009f6d5d568",
    },
  },
});
const client = new plaid.PlaidApi(configuration);

// Function to validate the Cognito token
const validateToken = async (token) => {
  try {
    // Fetch Cognito's JWKS
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

// DynamoDB connection
const getDBConnection = () => {
  console.log('DynamoDB creating connection');
  const config = {
    apiVersion: '2012-08-10',
    region: 'us-east-2',
    endpoint: 'http://host.docker.internal:8000', // Local DynamoDB
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

  if (!config.endpoint) {
    return DynamoDBDocumentClient.from(
      new DynamoDBClient({
        requestHandler: new AWS.NodeHttpHandler({
          httpsAgent: new https.Agent({
            maxSockets: 30,
            keepAlive: true,
          }),
        }),
      })
    );
  }

  return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};
const dynamodb = getDBConnection(); // Initialize DynamoDB client

// Handler to exchange public token for access token and fetch transactions
exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await validateToken(token);

    // Parse request body
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank;
    const id = body.id;
    const pastAccounts = body.accounts || [];
    const pk = body.pk;

    if (!pk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user id (pk)' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = exchangeResponse.data.access_token;

    // Fetch account details
    const accountResponse = await client.accountsGet({ access_token: accessToken });
    const account = accountResponse.data.accounts[0];

    // Fetch institution logo
    const logoResponse = await client.institutionsGetById({
      institution_id: id,
      country_codes: ['US'],
      options: { include_optional_metadata: true },
    });
    const institutionLogo = logoResponse.data.institution.logo;

    // Prepare new account details
    const newAccount = {
      Bank: bank,
      Logo: institutionLogo,
      Balance: account.balances.current,
      Mask: account.mask,
      Name: account.name,
      accountID: account.account_id,
      accessToken: accessToken,
    };

    // Combine with existing accounts
    const updatedAccounts = pastAccounts.length > 0 ? pastAccounts.concat(newAccount) : [newAccount];

    // Save to DynamoDB
    const params = {
      TableName: 'profileData',
      Item: {
        pk: pk,
        accounts: updatedAccounts,
        email: 'user@example.com',
        profilePhoto:
          'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii',
      },
    };

    await dynamodb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: accessToken,
        accounts: account.account_id,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

