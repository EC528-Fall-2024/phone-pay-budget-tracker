const plaid = require('plaid');

// const PLAID_CLIENT_ID = '67059ac70f3934001bb637ab'; // Move this to the .env file before pushing
// const PLAID_SECRET = '6480180b111c6e48efe009f6d5d568'; // Move this to the .env file before pushing
//const PLAID_ENV = plaid.PlaidEnvironments.sandbox;  // Use sandbox environment

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


const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')

const https = require('https');

// Function to create the DynamoDB connection
const getDBConnection = () => {
    console.log('DynamoDB creating connection');

    const config = {
        apiVersion: '2012-08-10',
        region: "us-east-2",
        endpoint: "http://host.docker.internal:8000", // Local DynamoDB
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


// Handler to exchange public token for access token and fetch transactions
exports.lambda_handler = async (event) => {
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank

    const tableName = 'profileData';  // Hardcoded table name
    const pk = body.pk;
    if (!pk) {
      return {
          statusCode: 400,  // Bad request if no pk is provided
          body: JSON.stringify({ error: 'Missing user id (pk)' }),
          headers: {
              'Content-Type': 'application/json'
          }
      };
    }
    

    try {
        //const exchangeResponse = await client.exchangePublicToken(publicToken);
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken});

        const accessToken = exchangeResponse.data.access_token;

        const accountResponse = await client.accountsGet({access_token: accessToken});
        console.log(accountResponse.data.accounts[0].account_id)
        
        console.log(pk)
        // const params = {
        //   TableName: tableName,
        //   Item: {
        //     pk: pk,  // Use the provided user id (pk) to fetch the data
        //     accessToken: accessToken,
        //     email: 'bmahoney132@gmail.com',
        //     profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
        //   }
        // };

        const params = {
          TableName: tableName,
          Item: {
            pk: pk,  // Use the provided user id (pk) to fetch the data
            accounts: [{'Bank':bank, 'accountID':accountResponse.data.accounts[0].account_id, 'accessToken':accessToken}],
            email: 'bmahoney132@gmail.com',
            profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
          }
        };
        
        // Ensure the command is awaited
        const response = await dynamodb.send(new PutCommand(params));

        console.log('DynamoDB response:', response.Item);
    
        return {
            statusCode: 200,
            body: JSON.stringify({
                accessToken: accessToken,
                accounts: accountResponse.data.accounts[0].account_id
            }),

        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "hello" }),
            //body: JSON.stringify({ error: error.message }),
        };
    }
};
