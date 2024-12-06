const plaid = require('plaid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Plaid client configuration
const configuration = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': '67059ac70f3934001bb637ab',  // Fetch from environment variables
            'PLAID-SECRET': '6480180b111c6e48efe009f6d5d568',        // Fetch from environment variables
        },
    },
});
const client = new plaid.PlaidApi(configuration);

// Lambda handler for webhook
exports.webhook_handler = async (event) => {

    const body = JSON.parse(event.body);

    // Initialize the DynamoDB client
    const awsEndpoint = process.env.AWS_ENDPOINT;
    const tableName = process.env.TABLE_NAME;

    const dynamodb = new DynamoDBClient({
        endpoint: awsEndpoint, 
        region: 'us-east-2',   
    });

    // Handle transaction updates
    if (body.webhook_code === 'TRANSACTIONS_UPDATED') {
        const accessToken = body.accessToken; // Fetch access token from your storage
        const transactionsRequest = {
            access_token: accessToken,
            start_date: '2024-01-01', // Use relevant dates
            end_date: '2024-11-01',
            options: {
                account_ids: body.account_ids, // Update only for specific account_ids
            },
        };

        try {
            const transactionsResponse = await client.transactionsSync(transactionsRequest);
            const transactions = transactionsResponse.data.added;

            // Store each transaction in DynamoDB
            const putPromises = transactions.map(async (transaction, index) => {
                const params = {
                    TableName: tableName,
                    Item: {
                        pk: 'bmahoney',  // User ID
                        sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`, // Unique sk
                        amount: transaction.amount,
                        expenseName: transaction.name || 'Unknown',
                    },
                };
                await dynamodb.send(new PutCommand(params));
            });

            await Promise.all(putPromises);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Transactions updated successfully' }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        } catch (error) {
            console.error('Error updating transactions:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to update transactions', message: error.message }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook received' }),
    };
};
