const plaid = require('plaid');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

// Cognito configuration
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;
const EXPECTED_AUDIENCE = process.env.EXPECTED_AUDIENCE;

const validateToken = async (token) => {
    try {
        const { data: jwks } = await axios.get(`${cognitoIssuer}/.well-known/jwks.json`);
        const { header } = jwt.decode(token, { complete: true });
        const jwk = jwks.keys.find((key) => key.kid === header.kid);
        if (!jwk) throw new Error('Invalid token');
        const pem = jwkToPem(jwk);
        return jwt.verify(token, pem, { 
            issuer: cognitoIssuer,
            audience: process.env.EXPECTED_AUDIENCE,
        });
    } catch (error) {
        console.error('Token validation failed:', error.message);
        throw new Error('Unauthorized');
    }
};

exports.lambda_handler = async (event) => {
    try {
        // Validate Authorization header
        const authHeader = event.headers?.Authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Missing Authorization token' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        await validateToken(token);

        // Parse the request body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const userId = requestBody.userId;

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing userId' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // Plaid client configuration
        const configuration = new plaid.Configuration({
            basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                    'PLAID-SECRET': process.env.PLAID_SECRET,
                },
            },
        });
        const client = new plaid.PlaidApi(configuration);

        const linkTokenCreateRequest = {
            user: {
                client_user_id: userId,
            },
            client_name: 'Plaid Tutorial',
            language: 'en',
            products: ['transactions'],
            country_codes: ['US'],
            webhook: 'https://www.example.com/webhook',
        };

        const linkTokenResponse = await client.linkTokenCreate(linkTokenCreateRequest);

        return {
            statusCode: 200,
            body: JSON.stringify(linkTokenResponse.data),
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
