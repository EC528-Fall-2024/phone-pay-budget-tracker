require('dotenv').config({ path: '../../../../../PhonePayBudgetTracker/.env' });
const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

// Initialize the Plaid client
const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
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

// Lambda handler to create a link token
exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await validateToken(token);

    // Parse the request body
    const body = JSON.parse(event.body);
    const userId = body.userId; // Extract userId from the request

    // Create the link token configuration
    const linkTokenConfig = {
      user: { client_user_id: userId }, // Use the userId received in the request
      client_name: 'Plaid Tutorial',
      language: 'en',
      products: ['transactions'], // Add the products you want to use
      country_codes: ['US'], // Country codes where you want to use Plaid
      webhook: 'https://www.example.com/webhook', // Optional: Add a webhook if needed
    };

    // Generate the link token using Plaid's API
    const tokenResponse = await client.linkTokenCreate(linkTokenConfig);

    // Return the link token to the client
    return {
      statusCode: 200,
      body: JSON.stringify({ link_token: tokenResponse.data.link_token }),
    };
  } catch (error) {
    console.error('Error creating link token:', error);
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
