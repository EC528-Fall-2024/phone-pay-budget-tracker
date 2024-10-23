const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');


// SAM AUTOMATICALLY CONNECTS NOW TO LOCAL DYNAMODB WHEN FUNCTION IS CALLED


// const https = require('https');

// // Function to create the DynamoDB connection
// const getDBConnection = () => {
//     console.log('DynamoDB creating connection');

//     const config = {
//         apiVersion: '2012-08-10',
//         region: "us-east-2",
//         endpoint: "http://host.docker.internal:8000", // Local DynamoDB (if applicable)
//         credentials: {
//             accessKeyId: "Secret",
//             secretAccessKey: "Secret",
//         },
//         maxAttempts: 2,
//         requestHandler: new NodeHttpHandler({
//             socketTimeout: 1000,
//             connectionTimeout: 1000,
//         }),
//     };

//     // Adjust the requestHandler if running in AWS by checking if the endpoint is undefined
//     if (!config.endpoint) {
//         return DynamoDBDocumentClient.from(new DynamoDBClient({
//             requestHandler: new AWS.NodeHttpHandler({
//                 httpsAgent: new https.Agent({
//                     maxSockets: 30,
//                     keepAlive: true,
//                 }),
//             }),
//         }));
//     }

//     return DynamoDBDocumentClient.from(new DynamoDBClient(config));
// };

// const dynamodb = getDBConnection(); // Initialize the DynamoDB client

// Lambda handler function to get all transactions for a user
exports.lambda_handler = async (event) => {
    const awsEndpoint = process.env.AWS_ENDPOINT;
    const tableName = process.env.TABLE_NAME;

    // Parse the pk (primary key) from the query string parameters or event body
    const pk = event.queryStringParameters?.pk || event.body?.pk;
    if (!pk) {
        return {
            statusCode: 400,  // Bad request if no pk is provided
            body: JSON.stringify({ error: 'Missing user id (pk)' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    const dynamoClient = new DynamoDBClient({
        endpoint: awsEndpoint, 
        region: 'us-east-2',   
    });

    const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

    const params = {
        TableName: tableName,
        Key: { pk }
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
                body: JSON.stringify({ error: 'Profile not found' }),
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

exports.lambda_handler_setProfile = async (event) => {
    const awsEndpoint = process.env.AWS_ENDPOINT;
    const tableName = process.env.TABLE_NAME; 

    const dynamoClient = new DynamoDBClient({
        endpoint: awsEndpoint, 
        region: 'us-east-2',   
    });

    const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

    // Parse the request body
    const requestBody = JSON.parse(event.body);

    const params = {
        TableName: tableName,
        Item: {
            pk: requestBody.pk || 'abcd',  // Primary key
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            username: requestBody.username,
            email: requestBody.email,
            profilePhoto: requestBody.profilePhoto,
        }
    };

    try {
        // Use PutCommand to insert or update data in DynamoDB
        await dynamodb.send(new PutCommand(params));

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile data saved successfully' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error occurred:', error.message);

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save profile data', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};