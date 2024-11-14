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
const iv = crypto.randomBytes(16);

function encryptUID(uid) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(uid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.createUserDocument = functions.https.onCall(async (data, context) => {
    const { email, username, uid } = data;
  
    await db.collection('users').doc(userId).set(
      {
          plaid_token: access_token,
      },
      { merge: true } 
    );

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

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

exports.fetchTransactions = functions.https.onRequest(async (req, res) => {
    const userId = req.body.user_id;
    const endDate = req.body.end_date || new Date().toISOString().split('T')[0];
  
    const defaultStartDate = new Date();
    // 1 year before
    //defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

    // 1 month before
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    //defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    const startDate = req.body.start_date || defaultStartDate.toISOString().split('T')[0];
  
    try {
      const userDoc = await db.collection('users').doc(userId).get();
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
  