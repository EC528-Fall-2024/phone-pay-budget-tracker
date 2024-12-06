const AWS = require('aws-sdk');
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
            audience: EXPECTED_AUDIENCE,
        });
    } catch (error) {
        console.error('Token validation failed:', error.message);
        throw new Error('Unauthorized');
    }
};

// Common CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins (adjust as needed)
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed headers
};

// Lambda handler function to get all transactions for a user
exports.lambda_handler = async (event) => {
    let body;
    try {
        if (event.body) {
            body = JSON.parse(event.body);
        }
    } catch (parseError) {
        console.error('Error parsing event body:', parseError);
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
    }

    const tableName = process.env.TABLE_NAME;

    // Validate Authorization header and extract token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    let decodedToken;
    try {
        decodedToken = await validateToken(token);
    } catch (err) {
        return {
            statusCode: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    // Use the sub claim from the token as the pk
    const pk = decodedToken.sub;

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
            ':pk': pk,
        },
        ScanIndexForward: true,
    };

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        // Query DynamoDB using DocumentClient
        const response = await dynamodb.query(params).promise();

        console.log('DynamoDB response:', response);

        if (response.Items && response.Items.length > 0) {
            // Return the found items (transactions)
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify(response.Items),
            };
        } else {
            // Handle no items found
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'No transactions found' }),
            };
        }
    } catch (error) {
        console.error('Error occurred during query:', error.message);
        console.error('Error details:', error.stack);

        // Return an error response
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to retrieve transactions', message: error.message }),
        };
    }
};

// Lambda handler function to store transactions in DynamoDB
exports.store_transactions_handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (parseError) {
        console.error('Error parsing event body:', parseError);
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
    }

    const tableName = process.env.TABLE_NAME;
    const transactions = body.transactions; // Expect transactions to be passed in request body

    // Validate Authorization header and extract token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    let decodedToken;
    try {
        decodedToken = await validateToken(token);
    } catch (err) {
        return {
            statusCode: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    // Use the sub claim from the token as the pk
    const pk = decodedToken.sub;

    // Validate input
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Transactions must be a non-empty array' }),
        };
    }

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        // Prepare all put operations
        const putPromises = transactions.map((transaction) => {
            if (!transaction.transaction_id) {
                throw new Error('Each transaction must have a transaction_id');
            }

            const params = {
                TableName: tableName,
                Item: {
                    pk: pk, // Use user's sub as pk
                    sk: `TRANSACTION#${transaction.transaction_id}`, // Sort key with unique transaction ID
                    ...transaction,
                },
            };
            return dynamodb.put(params).promise();
        });

        // Execute all put operations concurrently
        await Promise.all(putPromises);

        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Transactions stored successfully' }),
        };
    } catch (error) {
        console.error('Error occurred while storing transactions:', error.message);
        console.error('Error details:', error.stack);

        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to store transactions', message: error.message }),
        };
    }
};
