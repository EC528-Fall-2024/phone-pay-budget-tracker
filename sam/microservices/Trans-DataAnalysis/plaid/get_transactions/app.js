const plaid = require('plaid');

// const PLAID_CLIENT_ID = '67059ac70f3934001bb637ab'; // Move this to the .env file before pushing
// const PLAID_SECRET = '6480180b111c6e48efe009f6d5d568'; // Move this to the .env file before pushing
//const PLAID_ENV = plaid.environments.sandbox;  // Use sandbox environment

// // Check that the plaid.environments object exists
// if (!plaid || !plaid.environments) {
//     throw new Error("Plaid library failed to load environments");
// }

// Initialize the Plaid client
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

// Handler to exchange public token for access token and fetch transactions
exports.lambda_handler = async (event) => {
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;

    try {
        //const exchangeResponse = await client.exchangePublicToken(publicToken);
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken});

        const accessToken = exchangeResponse.data.access_token;
        console.log(accessToken)
        const request = {
            access_token: accessToken,
            start_date: '2018-01-01',
            end_date: '2024-11-01'
          };

        // return {
        //     statusCode: 200,
        //     body: JSON.stringify({
        //         status: 'Initializing',
        //         publicToken: publicToken,
        //         accessToken: accessToken,
        //         transactionsResponse: null,
        //         error: null,
        //     }),
        // };

        // Fetch transactions in the sandbox environment
        //const transactionsResponse = await client.getTransactions(accessToken, '2023-01-01', '2023-12-31');
        const transactionsResponse = await client.transactionsGet(request);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                total_transactions: transactionsResponse.data.transactions.length,  // Number of transactions
                transactions: transactionsResponse.data  // All the transactions in the response
            }),
            //body: JSON.stringify(transactionsResponse.data.transactions),

        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "hello" }),
            //body: JSON.stringify({ error: error.message }),
        };
    }
};
