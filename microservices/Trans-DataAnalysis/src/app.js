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

    // Use the sub claim from the token as the pk
    const pk = event.queryStringParameters?.pk || event.body?.pk;

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
