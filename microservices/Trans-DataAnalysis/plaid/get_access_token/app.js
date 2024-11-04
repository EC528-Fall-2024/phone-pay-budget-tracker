const plaid = require('plaid');

// Initialize the Plaid client
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

  const AWS = require('aws-sdk');
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

  exports.lambda_handler = async (event) => {
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank
    const id = body.id
    const pastAccounts = body.accounts


    // Initialize the DynamoDB client
    const awsEndpoint = process.env.AWS_ENDPOINT;
    const tableName = process.env.TABLE_NAME;

    const dynamodb = new DynamoDBClient({
        endpoint: awsEndpoint, 
        region: 'us-east-2',   
    });

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
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken});

        const accessToken = exchangeResponse.data.access_token;

        const accountResponse = await client.accountsGet({access_token: accessToken}); 
        console.log(accountResponse.data.accounts[0]) 

        console.log(id)

        const logo = await client.institutionsGetById({
            institution_id: id,
            country_codes: ['US'], // Specify your region, e.g., 'US'
            options : {
              include_optional_metadata: true,
            }
          });
  
          // console.log(logo.data.institution)
          console.log(logo.data.institution.logo)
  
  
          const institutionLogo = logo.data.institution.logo;
          
          newAccount = [{'Bank':bank, 'Logo': institutionLogo, 'Balance': accountResponse.data.accounts[0].balances.current, 'Mask': accountResponse.data.accounts[0].mask, 'Name': accountResponse.data.accounts[0].name, 'accountID':accountResponse.data.accounts[0].account_id, 'accessToken':accessToken}]
          let updatedAccounts = [];
          if (pastAccounts.length != 0) {
              // Append the new account to existing accounts
              updatedAccounts = pastAccounts.concat(newAccount[0]);
          } else {
              // If no existing accounts, start with the new account
              updatedAccounts = newAccount;
          }

          const params = {
            TableName: tableName,
            Item: {
              pk: pk,  // Use the provided user id (pk) to fetch the data
              accounts: updatedAccounts,//,
              email: 'bmahoney132@gmail.com',
              profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'
            }
          };

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
            body: JSON.stringify({ error: error.message }),
        };
    }

  }