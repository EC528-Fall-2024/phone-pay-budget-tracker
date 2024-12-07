const AWS = require('aws-sdk');
const plaid = require('plaid');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.getAccessTokenHandler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const publicToken = body.public_token;
    const bank = body.bank;
    const id = body.id;
    const pastAccounts = body.accounts || [];
    const pk = body.pk;

    console.log('Received body:', body);
    console.log('publicToken:', publicToken, 'pk:', pk, 'bank:', bank, 'id:', id, 'pastAccounts:', pastAccounts);

    if (!pk) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing user id (pk)' }),
      };
    }

    const tableName = process.env.TABLE_NAME;
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const configuration = new plaid.Configuration({
      basePath: plaid.PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const client = new plaid.PlaidApi(configuration);

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = exchangeResponse.data.access_token;

    // Get account details
    const accountResponse = await client.accountsGet({ access_token: accessToken });
    const account = accountResponse.data.accounts[0];

    let institutionLogo = '';
    try {
      const logoResponse = await client.institutionsGetById({
        institution_id: id,
        country_codes: ['US'],
        options: { include_optional_metadata: true },
      });
      institutionLogo = logoResponse.data.institution.logo || '';
    } catch (err) {
      console.error('Error fetching institution logo:', err);
    }

    const newAccount = {
      Bank: bank,
      Logo: institutionLogo,
      Balance: account.balances.current,
      Mask: account.mask,
      Name: account.name,
      accountID: account.account_id,
      accessToken: accessToken,
    };

    // Prepare the UpdateExpression to append the new account
    const params = {
      TableName: tableName,
      Key: { pk: pk },
      UpdateExpression: 'SET accounts = list_append(if_not_exists(accounts, :empty_list), :new_account)',
      ExpressionAttributeValues: {
        ':new_account': [newAccount], // Note: list_append requires both operands to be lists
        ':empty_list': [],
      },
      ReturnValues: 'UPDATED_NEW', // Optional: Returns the updated attributes
    };

    // Perform the update operation
    const updateResponse = await dynamodb.update(params).promise();
    console.log('DynamoDB updated with:', updateResponse.Attributes);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: accessToken,
        accountID: account.account_id, // Changed from 'accounts' to 'accountID' for clarity
      }),
    };
  } catch (error) {
    console.error('Error occurred:', error.message);
    console.error('Error details:', error.stack);
    const statusCode = error.message === 'Unauthorized' ? 401 : 500;
    return {
      statusCode: statusCode,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
