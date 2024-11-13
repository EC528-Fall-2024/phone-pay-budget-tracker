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


exports.createLinkToken = functions.https.onRequest(async (req, res) => {
  const clientUserId = 'user-id'; 

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


exports.exchangePublicToken = functions.https.onRequest(async (req, res) => {
    const publicToken = req.body.public_token;

    const request = {
        public_token: publicToken,
    };
  
    try {
        const getAccessTokenResponse = await plaidClient.itemPublicTokenExchange(request);
        res.json(getAccessTokenResponse.data);
    }catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ error: 'Failed to exchange public token' });
    }
  });