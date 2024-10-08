const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')

const https = require('https');

// Function to create the DynamoDB connection
const getDBConnection = () => {
    console.log('DynamoDB creating connection');

    const config = {
        apiVersion: '2012-08-10',
        region: "us-east-2",
        endpoint: "http://host.docker.internal:8000", // Local DynamoDB (if applicable)
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

// Lambda handler function to get all transactions for a user
exports.lambda_handler = async (event) => {
    const tableName = 'transactionData'; // Hardcoded table name
    const pk = 'bmahoney'; // The user's ID

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
            ':pk': pk, // The user's primary key
        },
        ScanIndexForward: true, // Sort ascending by sort key (`sk`)
    };

    try {
        // Ensure the command is awaited
        const response = await dynamodb.send(new QueryCommand(params));

        console.log('DynamoDB response:', response);

        if (response.Items && response.Items.length > 0) {
            // Return the found items (transactions)
            return {
                statusCode: 200,
                body: JSON.stringify(response.Items),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } else {
            // Handle not found
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No transactions found' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
    } catch (error) {
        console.error('Error occurred during query:', error.message);
        console.error('Error details:', error.stack);

        // Return an error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve transactions', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
