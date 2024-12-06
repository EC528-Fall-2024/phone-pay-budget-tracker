import axios from 'axios';
import { Auth } from 'aws-amplify';

// Dynamically set API base URL (replace with your environment variable setup)
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// Utility function to fetch ID token from Cognito
const getIdToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};

/**
 * Fetches the Plaid link token from the backend Lambda function.
 * @returns {Promise<string>} - Returns the link token from Plaid.
 */
export const fetchLinkToken = async () => {
  try {
    const idToken = await getIdToken();
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/create-link-token`,
      {}, // No need to pass userId from the client
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.link_token;
  } catch (error) {
    console.error('Error fetching Plaid link token:', error);
    throw new Error('Failed to fetch Plaid link token. Please try again.');
  }
};

/**
 * Exchanges the public token for an access token.
 * @param {string} publicToken - The public token received from Plaid Link.
 * @param {string} bank - The bank name.
 * @param {string} id - The bank ID.
 * @param {Array} accounts - The user's accounts.
 * @returns {Promise<object>} - Returns the access token and transaction data.
 */
export const onSuccess = async (publicToken, bank, id, accounts) => {
  try {
    const idToken = await getIdToken();
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/get-access-token`,
      {
        public_token: publicToken,
        bank,
        id,
        accounts,
      },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error exchanging public token for access token:', error);
    throw new Error('Failed to fetch access token. Please try again.');
  }
};

/**
 * Fetches transactions from the backend Lambda function.
 * @param {string} accessToken - The access token for Plaid.
 * @returns {Promise<object>} - Returns the transaction data.
 */
export const getTransactions = async (accessToken) => {
  try {
    const idToken = await getIdToken();
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/get-transactions`,
      { accessToken },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions. Please try again.');
  }
};

/**
 * Fetches the authenticated user's profile data.
 * @returns {Promise<object>} - Returns the user's profile data.
 */
export const getProfileData = async () => {
  try {
    const idToken = await getIdToken();
    const response = await axios.get(`https://g7t2wcleej.execute-api.us-east-2.amazonaws.com/Prod/user-profile`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw new Error('Failed to fetch profile data. Please try again.');
  }
};

/**
 * Updates the authenticated user's profile data.
 * @param {object} data - The profile data to update.
 * @returns {Promise<object>} - Returns the updated profile data.
 */
export const setProfileData = async (data) => {
  try {
    const idToken = await getIdToken();
    const response = await axios.post(`https://g7t2wcleej.execute-api.us-east-2.amazonaws.com/Prod/user-profile`, data, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating profile data:', error);
    throw new Error('Failed to update profile data. Please try again.');
  }
};

/**
 * Fetches transaction data stored in the database.
 * @returns {Promise<object>} - Returns the user's transaction data.
 */
export const getTransactionData = async () => {
  try {
    const idToken = await getIdToken();
    const response = await axios.get(`https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/transactions/store`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw new Error('Failed to fetch transaction data. Please try again.');
  }
};
