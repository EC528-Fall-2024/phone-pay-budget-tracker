const AWS = require('aws-sdk');
const plaid = require('plaid');
require('dotenv').config({ path: '../../../../../PhonePayBudgetTracker/.env' });

// Lambda handler to exchange public token for access token, fetch transactions, and store them in DynamoDB
exports.lambda_handler = async (event) => {
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken;
    const userId = body.pk; // The primary key for the user

    const tableName = process.env.TABLE_NAME;

    if (!userId || !accessToken) {
        return {
            statusCode: 400, // Bad request if no pk is provided
            body: JSON.stringify({ error: 'Missing accessToken or userId' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();

        // Plaid client configuration
        const configuration = new plaid.Configuration({
            basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': "67059ac70f3934001bb637ab",
                    'PLAID-SECRET': "6480180b111c6e48efe009f6d5d568",
                },
            },
        });
        const client = new plaid.PlaidApi(configuration);

        const request = {
            access_token: accessToken,
            start_date: '2024-01-01',
            end_date: '2024-11-01',
        };

        // Fetch transactions in the sandbox environment
        const transactionsResponse = await client.transactionsGet(request);
        const transactions = transactionsResponse.data.transactions;

        // Iterate over each transaction and store it in DynamoDB
        const putPromises = transactions.map(async (transaction, index) => {
            const params = {
                TableName: tableName,
                Item: {
                    pk: userId, // User ID as the partition key
                    sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`, // Unique sort key per transaction
                    amount: transaction.amount,
                    expenseName: transaction.name || 'Unknown',
                },
            };

            await dynamodb.put(params).promise();
        });

        // Wait for all put operations to complete
        await Promise.all(putPromises);

        return {
            statusCode: 200,
            
            body: JSON.stringify({ 
                message: 'Transactions stored successfully',
                data: transactionsResponse.data.transactions,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error occurred:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to store transactions', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
