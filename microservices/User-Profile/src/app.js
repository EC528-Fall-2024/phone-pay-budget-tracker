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
            audience: process.env.EXPECTED_AUDIENCE,
         });
    } catch (error) {
        console.error('Token validation failed:', error.message);
        throw new Error('Unauthorized');
    }
};

exports.lambda_handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        // Validate Authorization header and extract token
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await validateToken(token);

        // Use the `sub` claim as the partition key
        const userSub = decodedToken.sub;

        const params = {
            TableName: tableName,
            Key: { pk: userSub },
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
            body: JSON.stringify({ error: 'Unable to retrieve profile data.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};


exports.lambda_handler_setProfile = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        // Validate Authorization header and extract token
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await validateToken(token);

        // Use the `sub` claim as the partition key
        const userSub = decodedToken.sub;

        // Parse the request body
        const requestBody = JSON.parse(event.body);

        const params = {
            TableName: tableName,
            Item: {
                pk: userSub, // Securely set `pk` to user's `sub`
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
            body: JSON.stringify({ error: 'Unable to update profile data.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};
