const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')

const https = require('https');

// Function to create the DynamoDB connection
const getDBConnection = () => {
    console.log('DynamoDB creating connection');

    const config = {
        apiVersion: '2012-08-10',
        region: "us-east-2",
        endpoint: "http://host.docker.internal:8000", // Local DynamoDB
        credentials: {
            accessKeyId: "Secret",
            secretAccessKey: "Secret",
        },
        maxAttempts: 2,
        requestHandler: new NodeHttpHandler({
            socketTimeout: 1000,
            connectionTimeout: 1000,
        }),
    };

    // Adjust the requestHandler if running in AWS by checking if the endpoint is undefined
    if (!config.endpoint) {
        return DynamoDBDocumentClient.from(new DynamoDBClient({
            requestHandler: new AWS.NodeHttpHandler({
                httpsAgent: new https.Agent({
                    maxSockets: 30,
                    keepAlive: true,
                }),
            }),
        }));
    }

    return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};

const dynamodb = getDBConnection(); // Initialize the DynamoDB client

// Lambda handler function
exports.lambda_handler = async (event) => {
    const tableName = 'profileData'; // Hardcoded table name
    pk = 'abcd'

    const params = {
        TableName: tableName,
        Key: {
            pk: pk // This will be the unique user id
        }
    };

    try {
        // Ensure the command is awaited
        const response = await dynamodb.send(new GetCommand(params));

        console.log('DynamoDB response:', response);

        if (response.Item) {
            // Return the found item
            return {
                statusCode: 200,
                body: JSON.stringify(response.Item),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } else {
            // Handle not found
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Item not found' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        console.error('Error details:', error.stack);

        // Return an error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve item', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
