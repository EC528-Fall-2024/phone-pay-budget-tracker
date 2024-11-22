require('dotenv').config({ path: '../../../../../Fronted/.env' });
const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

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

exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await validateToken(token);

    // Use the `sub` as the unique user identifier
    const userSub = decodedToken.sub;

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

    // Create the link token configuration
    const linkTokenConfig = {
      user: { client_user_id: userSub },
      client_name: 'Plaid Tutorial',
      language: 'en',
      products: ['transactions'],
      country_codes: ['US'],
      webhook: 'https://www.example.com/webhook', // Optional: Add webhook if needed
    };

    // Generate the link token using Plaid's API
    const tokenResponse = await client.linkTokenCreate(linkTokenConfig);

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
