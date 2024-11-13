const functions = require('firebase-functions');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': functions.config().plaid.client_id,
      'PLAID-SECRET': functions.config().plaid.secret,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Cloud function to create a link token
exports.createLinkToken = functions.https.onRequest(async (req, res) => {
  const clientUserId = 'user-id'; // Replace with real logic to get a unique user ID

  const request = {
    user: {
      client_user_id: clientUserId,
    },
    client_name: 'Phone Pay Budget Tracker',
    products: ['auth', 'transactions'],
    transactions: {
        days_requested: 730
    },    
    language: 'en',
    webhook: 'https://webhook.example.com',
    redirect_uri: 'https://domainname.com/oauth-page.html',
    country_codes: ['US'],
    account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings']
        },
        credit: {
          account_subtypes: ['credit card']
        }
    }
  };

  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    res.json(createTokenResponse.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).send('Failed to create link token');
  }
});
