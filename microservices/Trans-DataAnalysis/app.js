const AWS = require('aws-sdk');


// Lambda handler function to get all transactions for a user
exports.lambda_handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (parseError) {
        console.error('Error parsing event body:', parseError);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const tableName = process.env.TABLE_NAME;

    // Parse the primary key (pk) from query string parameters or request body
    const pk = event.queryStringParameters?.pk || body?.pk;

    if (!pk) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing primary key (pk) in request' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
            ':pk': pk,
        },
        ScanIndexForward: true, // Sort ascending by sort key (`sk`)
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
                body: JSON.stringify(response.Items),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        } else {
            // Handle not found
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No transactions found' }),
                headers: {
                    'Content-Type': 'application/json',
                },
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
                'Content-Type': 'application/json',
            },
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
            body: JSON.stringify({ error: 'Invalid JSON in request body' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const tableName = process.env.TABLE_NAME;
    const transactions = body.transactions; // Assume transactions are passed in the event body
    const pk = body.pk; // Extract pk from the request body

    // Validate input
    if (!pk) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing primary key (pk) in request body' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Transactions must be a non-empty array' }),
            headers: { 'Content-Type': 'application/json' },
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
                    pk: pk, // Primary key, e.g., user ID
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
            body: JSON.stringify({ message: 'Transactions stored successfully' }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Error occurred while storing transactions:', error.message);
        console.error('Error details:', error.stack);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to store transactions', message: error.message }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
};
