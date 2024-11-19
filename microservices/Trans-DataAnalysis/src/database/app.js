const plaid = require('plaid');
const AWS = require('aws-sdk');

exports.lambda_handler = async (event) => {
    const tableName = process.env.TABLE_NAME; 

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();

        // Initialize the Plaid client 
        const configuration = new plaid.Configuration({
            basePath: plaid.PlaidEnvironments.sandbox, // Use sandbox environment for testing
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID, // Fetch from environment variables
                    'PLAID-SECRET': process.env.PLAID_SECRET,         // Fetch from environment variables
                },
            },
        });

        const client = new plaid.PlaidApi(configuration);

        // Parse the request body
        const body = JSON.parse(event.body);
        const publicToken = body.public_token;
        const bank = body.bank;
        const pk = body.pk;

        // Validate the presence of 'pk'
        if (!pk) {
            return {
                statusCode: 400, // Bad request if no pk is provided
                body: JSON.stringify({ error: 'Missing user id (pk)' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Exchange public token for access token
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken
        });

        const accessToken = exchangeResponse.data.access_token;

        // Get account details
        const accountResponse = await client.accountsGet({ access_token: accessToken });
        const accountId = accountResponse.data.accounts[0].account_id;

        // Prepare parameters for DynamoDB put operation
        const params = {
            TableName: tableName,
            Item: {
                pk: pk, // Primary key
                accounts: [{
                    Bank: bank,
                    accountID: accountId,
                    accessToken: accessToken
                }],
                email: 'bmahoney132@gmail.com',
                profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
            }
        };

        // Insert or update item in DynamoDB
        await dynamodb.put(params).promise();

        console.log('DynamoDB response:', params.Item);

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                accessToken: accessToken,
                accounts: accountId
            }),
        };
    } catch (error) {
        console.error('Error occurred:', error.message);
        console.error('Error details:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "ERROR" }),
            //body: JSON.stringify({ error: error.message }),
        };
    }
};
