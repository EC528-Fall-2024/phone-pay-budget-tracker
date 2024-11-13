const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

admin.initializeApp();
const db = admin.firestore();

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
    const userId = req.body.user_id;

    const request = {
        public_token: publicToken,
    };
  
    try {
        const getAccessTokenResponse = await plaidClient.itemPublicTokenExchange(request);
        const { access_token, item_id } = getAccessTokenResponse.data;

        await db.collection('users').doc(userId).set(
            {
                plaid_token: access_token,
            },
            { merge: true } 
          );
        res.json({ message: 'Access token successfully stored in db' });
    }catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ error: 'Failed to exchange public token' });
    }
  });