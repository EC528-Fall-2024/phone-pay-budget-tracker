const plaid = require('plaid');
require('dotenv').config({ path: '../../../../../Frontend/.env' });
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const AWS = require('aws-sdk');


// Cognito setup
const cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;

// Function to validate the Cognito token
const validateToken = async (token) => {
  try {
    // Fetch Cognito's JWKS
    const { data: jwks } = await axios.get(`${cognitoIssuer}/.well-known/jwks.json`);
    const { header } = jwt.decode(token, { complete: true });
    const jwk = jwks.keys.find((key) => key.kid === header.kid);
    if (!jwk) throw new Error('Invalid token');

    // Convert JWK to PEM
    const pem = jwkToPem(jwk);

    // Verify the token
    return jwt.verify(token, pem, { issuer: cognitoIssuer });
  } catch (error) {
    console.error('Token validation failed:', error);
    throw new Error('Unauthorized');
  }
};

// Handler to exchange public token for access token and fetch transactions
exports.lambda_handler = async (event) => {
  try {
    // Extract and validate the token
    const authHeader = event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await validateToken(token);

    // Parse request body
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank
    const id = body.id
    const pastAccounts = body.accounts || [];

    const tableName = process.env.TABLE_NAME; 

    const pk = body.pk;

    if (!pk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user id (pk)' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    

    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();

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

        //const exchangeResponse = await client.exchangePublicToken(publicToken);
        const exchangeResponse = await client.itemPublicTokenExchange({
            public_token: publicToken});

        const accessToken = exchangeResponse.data.access_token;

        const accountResponse = await client.accountsGet({access_token: accessToken}); 
        console.log(accountResponse.data.accounts[0]) 
        
        // console.log(accountResponse) 

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
        
        // Ensure the command is awaited
        const response = await dynamodb.put(params).promise();

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
};

