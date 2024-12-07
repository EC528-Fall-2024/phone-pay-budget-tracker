const AWS = require('aws-sdk');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

exports.lambda_handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    console.log("queryStringParameters:", event.queryStringParameters);

    // Extract pk from query params only, since it's a GET request
    const pk = event.queryStringParameters?.pk;

    if (!pk) {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Missing user id (pk)" }),
        };
    }

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
            ':pk': pk,
        },
        ScanIndexForward: true,
    };

    try {
        const response = await dynamodb.query(params).promise();
        console.log('DynamoDB response:', response);

        if (response.Items && response.Items.length > 0) {
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify(response.Items),
            };
        } else {
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'No transactions found' }),
            };
        }
    } catch (error) {
        console.error('Error occurred during query:', error.message);
        console.error('Error details:', error.stack);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to retrieve transactions', message: error.message }),
        };
    }
};

