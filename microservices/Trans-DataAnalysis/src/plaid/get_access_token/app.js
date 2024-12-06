const plaid = require('plaid');
require('dotenv').config({ path: '../../../../../Frontend/.env' });
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const AWS = require('aws-sdk');

// Cognito setup
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;
const EXPECTED_AUDIENCE = process.env.EXPECTED_AUDIENCE;

// Common CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Allow all origins; adjust for security as needed
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Function to validate the Cognito token
const validateToken = async (token) => {
  try {
    // Fetch Cognito's JWKS
    const { data: jwks } = await axios.get(`${cognitoIssuer}/.well-known/jwks.json`);
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || !decoded.header) {
      throw new Error('Invalid token structure');
    }

    const { header } = decoded;
    const jwk = jwks.keys.find((key) => key.kid === header.kid);
    if (!jwk) throw new Error('Invalid token');

    // Convert JWK to PEM
    const pem = jwkToPem(jwk);

    // Verify the token
    return jwt.verify(token, pem, { 
      issuer: cognitoIssuer,
      audience: process.env.EXPECTED_AUDIENCE,
    });
  } catch (error) {
    console.error('Token validation failed:', error);
    throw new Error('Unauthorized');
  }
};

exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing Authorization token' }),
      };
    }

    const decodedToken = await validateToken(token);

    // Use the `sub` as the unique user identifier
    const userSub = decodedToken.sub;

    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank;
    const id = body.id;
    const pastAccounts = body.accounts || [];

    const tableName = process.env.TABLE_NAME;
    const pk = body.pk;

    if (!pk) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing user id (pk)' }),
      };
    }

    // Initialize the DynamoDB DocumentClient
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

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;

    // Get account details
    const accountResponse = await client.accountsGet({ access_token: accessToken });
    const account = accountResponse.data.accounts[0];
    const mockAccountId = account.account_id;

    // Get institution logo
    const logoResponse = await client.institutionsGetById({
      institution_id: id,
      country_codes: ['US'], // Specify your region, e.g., 'US'
      options: {
        include_optional_metadata: true,
      },
    });

    const institutionLogo = logoResponse.data.institution.logo;

    // Prepare the new account object
    const newAccount = {
      Bank: bank,
      Logo: institutionLogo,
      Balance: account.balances.current,
      Mask: account.mask,
      Name: account.name,
      accountID: account.account_id,
      accessToken: accessToken,
    };

    // Update accounts
    const updatedAccounts = pastAccounts.length !== 0 ? [...pastAccounts, newAccount] : [newAccount];

    // Prepare parameters for DynamoDB put operation
    const params = {
      TableName: tableName,
      Item: {
        pk: pk, // Primary key
        accounts: updatedAccounts,
        email: 'bmahoney132@gmail.com',
        profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii',
      },
    };

    // Insert or update item in DynamoDB
    await dynamodb.put(params).promise();

    console.log('DynamoDB response:', params.Item);

    // Return success response
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: accessToken,
        accounts: account.account_id,
      }),
    };
  } catch (error) {
    console.error('Error occurred:', error.message);
    console.error('Error details:', error.stack);
    const statusCode = error.message === 'Unauthorized' ? 401 : 500;
    return {
      statusCode: statusCode,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
