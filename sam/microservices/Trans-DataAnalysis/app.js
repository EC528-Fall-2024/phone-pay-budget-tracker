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

// Lambda handler function to store transactions in DynamoDB
exports.store_transactions_handler = async (event) => {
    const tableName = 'transactionData'; // Table name where transactions will be stored
    const transactions = JSON.parse(event.body).transactions; // Assume transactions are passed in the event body
    const pk = 'bmahoney'; // Replace this with actual user identifier as needed

    try {
        const putPromises = transactions.map((transaction) => {
            const params = {
                TableName: tableName,
                Item: {
                    pk: pk, // Primary key, e.g., user ID
                    sk: `TRANSACTION#${transaction.transaction_id}`, // Sort key with unique transaction ID
                    ...transaction,
                },
            };
            return dynamodb.send(new PutCommand(params)); // Execute the put command for each transaction
        });

        await Promise.all(putPromises); // Wait for all put commands to complete

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Transactions stored successfully' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error occurred while storing transactions:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to store transactions', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
