const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

// Initialize the DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get the table name from environment variables
const tableName = process.env.TABLE_NAME;

// Cognito configuration
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;

const validateToken = async (token) => {
    try {
        const { data: jwks } = await axios.get(`${cognitoIssuer}/.well-known/jwks.json`);
        const { header } = jwt.decode(token, { complete: true });
        const jwk = jwks.keys.find((key) => key.kid === header.kid);
        if (!jwk) throw new Error('Invalid token');
        const pem = jwkToPem(jwk);
        return jwt.verify(token, pem, { issuer: cognitoIssuer });
    } catch (error) {
        console.error('Token validation failed:', error.message);
        throw new Error('Unauthorized');
    }
};

exports.lambda_handler = async (event) => {
    try {
        // Validate Authorization header
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        await validateToken(token);

        // Parse the pk (primary key) from the query string parameters
        const pk = event.queryStringParameters?.pk;

        if (!pk) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing user id (pk)' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        const params = {
            TableName: tableName,
            Key: { pk },
        };

        const response = await dynamodb.get(params).promise();

        if (response.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify(response.Item),
                headers: { 'Content-Type': 'application/json' },
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Profile not found' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        return {
            statusCode: error.message === 'Unauthorized' ? 401 : 500,
            body: JSON.stringify({ error: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};

exports.lambda_handler_setProfile = async (event) => {
    try {
        // Validate Authorization header
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        await validateToken(token);

        // Parse the request body
        const requestBody = JSON.parse(event.body);

        if (!requestBody.pk) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing user id (pk)' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        const params = {
            TableName: tableName,
            Item: {
                pk: requestBody.pk,
                email: requestBody.email,
                profilePhoto: requestBody.profilePhoto,
            },
        };

        await dynamodb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile data saved successfully' }),
            headers: { 'Content-Type': 'application/json' },
        };
    } catch (error) {
        console.error('Error occurred:', error.message);
        return {
            statusCode: error.message === 'Unauthorized' ? 401 : 500,
            body: JSON.stringify({ error: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};
