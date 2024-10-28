// const plaid = require('plaid');

// // const PLAID_CLIENT_ID = '67059ac70f3934001bb637ab'; // Move this to the .env file before pushing
// // const PLAID_SECRET = '6480180b111c6e48efe009f6d5d568'; // Move this to the .env file before pushing
// //const PLAID_ENV = plaid.PlaidEnvironments.sandbox;  // Use sandbox environment

// // Initialize the Plaid client
// const configuration = new plaid.Configuration({
//     basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
//     baseOptions: {
//       headers: {
//         'PLAID-CLIENT-ID': '67059ac70f3934001bb637ab',  // Fetch from environment variables
//         'PLAID-SECRET': '6480180b111c6e48efe009f6d5d568',        // Fetch from environment variables
//       },
//     },
//   });
  
//   const client = new plaid.PlaidApi(configuration);

// // Handler to exchange public token for access token and fetch transactions
// exports.lambda_handler = async (event) => {
//     const body = JSON.parse(event.body);
//     const accessToken = body.accessToken;

//     try {
        
//         const request = {
//             access_token: accessToken,
//             start_date: '2024-01-01',
//             end_date: '2024-11-01',
//             //account_ids: [accountResponse.accounts[0].account_id]
//           };

//         // Fetch transactions in the sandbox environment
//         const transactionsResponse = await client.transactionsGet(request);
//         // console.log(transactionsResponse.data)
        
//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 data: transactionsResponse.data.transactions,    
//             }),

//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: error.message }),
//         };
//     }
// };

const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
const plaid = require('plaid');

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

    return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};

const dynamodb = getDBConnection(); // Initialize the DynamoDB client

// Plaid client configuration
const configuration = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': '67059ac70f3934001bb637ab',  // Fetch from environment variables
        'PLAID-SECRET': '6480180b111c6e48efe009f6d5d568',        // Fetch from environment variables
      },
    },
});
const client = new plaid.PlaidApi(configuration);

// Lambda handler to exchange public token for access token, fetch transactions, and store them in DynamoDB
exports.lambda_handler = async (event) => {
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken;
    const userId = body.pk; // The primary key for the user

    try {
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
                TableName: 'transactionData',
                Item: {
                    pk: userId, // User ID as the partition key
                    sk: `${transaction.date}#t-${index.toString().padStart(3, '0')}`, // Unique sort key per transaction
                    amount: transaction.amount,
                    expenseName: transaction.name || 'Unknown',
                },
            };

            await dynamodb.send(new PutCommand(params));
        });

        // Wait for all put operations to complete
        await Promise.all(putPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Transactions stored successfully' }),
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
