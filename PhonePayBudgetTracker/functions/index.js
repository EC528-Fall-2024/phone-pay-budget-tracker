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
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const crypto = require('crypto');

const key = crypto.createHash('sha256').update("phonepaybudgettracker").digest();
const iv = Buffer.alloc(16, 0);

function encryptUID(uid) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(uid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.createUserDocument = functions.https.onCall(async (data, context) => {
    const { email, username, uid } = data;
    const encryptedUID = encryptUID(uid);
    try {
      await db.collection('users').doc(encryptedUID).set({
        email: email,
        name: username,
        phone: "",
        country: "",
        profile_pic: "",
        plaid_token: "",
        is_admin: false,
      });
      return { success: true };
    } catch (error) {
      console.error("Error creating user document:", error);
      throw new functions.https.HttpsError("internal", "Failed to create user document.");
    }
  });

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.getUserData = functions.https.onCall(async (data, context) => {
  const { uid } = data;
  const encryptedUID = encryptUID(uid);
  try {
    const userDoc = await db.collection('users').doc(encryptedUID).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User data not found.');
    }
    const { name, country, phone } = userDoc.data();
    return { name, country, phone };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch user data.");
  }
});

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

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
    redirect_uri: 'https://google.com',
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

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.exchangePublicToken = functions.https.onRequest(async (req, res) => {
    const publicToken = req.body.public_token;
    const userId = req.body.user_id;

    const request = {
        public_token: publicToken,
    };
  
    try {
        const getAccessTokenResponse = await plaidClient.itemPublicTokenExchange(request);
        const { access_token, item_id } = getAccessTokenResponse.data;
        const encryptedUID = encryptUID(userId);
        await db.collection('users').doc(encryptedUID).set(
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

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.fetchTransactions = functions.https.onRequest(async (req, res) => {
  const userId = req.body.user_id;
  const month = parseInt(req.body.month || new Date().getMonth() + 1); 
  const year = parseInt(req.body.year || new Date().getFullYear()); 

  if (month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid month. Must be between 1 and 12.' });
  }

  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; 

  const encryptedUID = encryptUID(userId);
  try {
    const userDoc = await db.collection('users').doc(encryptedUID).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const accessToken = userDoc.data()?.plaid_token;
    if (!accessToken) return res.status(400).json({ error: 'Access token not available' });

    const request = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    };
    const transactionsResponse = await plaidClient.transactionsGet(request);
    const transactions = transactionsResponse.data.transactions;

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
  
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.getAccountBalances = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const encryptedUID = encryptUID(userId);
    const userDoc = await admin.firestore().collection('users').doc(encryptedUID).get();

    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const accessToken = userDoc.data()?.plaid_token;
    if (!accessToken) return res.status(400).json({ error: 'Access token not available' });
    
    const request = {
      access_token: accessToken,
    };

    const balanceResponse = await plaidClient.accountsBalanceGet(request);

    res.json( balanceResponse.data )

  } catch (error) {
    console.error('Error fetching account balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});