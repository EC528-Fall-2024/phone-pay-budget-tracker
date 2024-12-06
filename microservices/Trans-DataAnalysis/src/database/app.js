const plaid = require('plaid');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;
const EXPECTED_AUDIENCE = process.env.EXPECTED_AUDIENCE;

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
      return jwt.verify(token, pem, { issuer: cognitoIssuer, audience: EXPECTED_AUDIENCE });
    } catch (error) {
      console.error('Token validation failed:', error.message);
      throw new Error('Unauthorized');
    }
  };

exports.lambda_handler = async (event) => {
    const tableName = process.env.TABLE_NAME; 

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();

        // Extract and validate the token
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return {
              statusCode: 401, // Unauthorized if no token is provided
              body: JSON.stringify({ error: 'Missing Authorization token' }),
              headers: { 'Content-Type': 'application/json' },
            };
        }

        const decodedToken = await validateToken(token);

        // Use the `sub` from the decoded token as the primary key
        const userSub = decodedToken.sub;

        // Parse the request body
        const body = JSON.parse(event.body);
        const publicToken = body.public_token;
        const bank = body.bank;

        // Exchange public token for access token
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

        // Validate the presence of 'pk'
        if (!pk) {
            return {
                statusCode: 400, // Bad request if no pk is provided
                body: JSON.stringify({ error: 'Missing user id (pk)' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Exchange public token for access token
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken
        });

        const accessToken = exchangeResponse.data.access_token;

        // Get account details
        const accountResponse = await client.accountsGet({ access_token: accessToken });
        const accountId = accountResponse.data.accounts[0].account_id;

        // Prepare parameters for DynamoDB put operation
        const params = {
            TableName: tableName,
            Item: {
                pk: pk, // Primary key
                accounts: [{
                    Bank: bank,
                    accountID: accountId,
                    accessToken: accessToken
                }],
                email: 'bmahoney132@gmail.com',
                profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
            }
        };

        // Insert or update item in DynamoDB
        await dynamodb.put(params).promise();

        console.log('DynamoDB response:', params.Item);

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                accessToken: accessToken,
                accounts: accountId
            }),
        };
    } catch (error) {
        console.error('Error occurred:', error.message);
        console.error('Error details:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "ERROR" }),
            //body: JSON.stringify({ error: error.message }),
        };
    }
};
