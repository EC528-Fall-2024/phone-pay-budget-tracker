import axios from 'axios';
import { Auth } from 'aws-amplify';  // Import Amplify Auth



// Replace with your actual API Gateway URL and API keys if needed
const API_URL = 'http://localhost:3000'; 

const API_BASE_URL = 'http://localhost:3000';


// function to get ID token from AWS
const getIdToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
}


/**
 * Fetches the Plaid link token from the backend Lambda function.
 * 
 * @param {string} userId - Unique identifier for the user.
 * @returns {Promise<string>} - Returns the link token from Plaid.
 */
export const fetchLinkToken = async (userId) => {
  try {
    // get id token
    const idToken = await getIdToken();
    const response = await axios.post(
      `${API_BASE_URL}/trans-dataanalysis/plaid/create_link_token`,
      { userId },
      {
        // pass the id token as a header
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.link_token;
  } catch (error) {
    console.error('Error fetching link token:', error);
    throw new Error('Unable to fetch link token');
  }
};

/**
 * Exchanges the public token for an access token
 * 
 * @param {string} publicToken - The public token received from Plaid Link.
 * @returns {Promise<object>} - Returns the transaction data from Plaid.
 */
export const onSuccess = async (publicToken, bank, id, accounts) => {
  try {
    // get id token
    const idToken = await getIdToken();

    const currentUser = await Auth.currentAuthenticatedUser();
    console.log(currentUser.username)
    const response = await axios.post(
      `${API_BASE_URL}/trans-dataanalysis/plaid/get_access_token`, // Post because we are sending confidential info, we will still receive the transactions
      {
        public_token: publicToken,
        pk: currentUser.username.toString(),
        bank: bank,
        id: id,
        accounts: accounts,
      },
      {
        // pass the id token as a header
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // console.log(response.data.totalTransactions)
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Unable to fetch transactions');
  }
};

/**
 * fetches transactions from Plaid.
 * 
 * @param {string} accessToken - The public token received from Plaid Link.
 * @returns {Promise<object>} - Returns the transaction data from Plaid.
 */
 export const getTransactions = async (accessToken) => { // This gets transaction data from Plaid
  try {
    // get id token
    const idToken = await getIdToken();

    const currentUser = await Auth.currentAuthenticatedUser();
    const response = await axios.post(`${API_BASE_URL}/trans-dataanalysis/plaid/get_transactions`, { // Post because we are sending confidential info, we will still receive the transactions
      accessToken: accessToken.accessToken,
      pk: currentUser.username.toString(),
    },
    {
      // pass the id token as a header
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    }
    );
    // console.log(response.data.totalTransactions)
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Unable to fetch transactions');
  }
};




// Example function to handle GET request

export const getProfileData = async () => {
  try {
    // get id token
    const idToken = await getIdToken();

    // Get the current authenticated user
    const currentUser = await Auth.currentAuthenticatedUser();
    
    // Extract the username or sub from the user details
    const { username } = currentUser;
    
    // Make the API call with the username (you can pass it as a query param or request body)
    const response = await axios.get(`${API_URL}/user-profile`, {
      params: { pk: username },  // Pass the username as a query parameter (pk)
      headers: {
        Authorization: `Bearer ${idToken}`,
        //'x-api-key': 'your-api-key',  // Add if API Gateway requires an API key
        'Content-Type': 'application/json',
        }
    });

    return response.data;  // Return the fetched profile data
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

export const setProfileData = async (data) => {
  try {   
    // get id token
    const idToken = await getIdToken(); 

    const response = await axios.post(`${API_URL}/user-profile`, data, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        //'x-api-key': 'your-api-key',  // Include if API Gateway requires an API key
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Return response data on success
  } catch (error) {
    console.error('Error posting profile data:', error);
    throw error; // Re-throw the error for further handling
  }
};

export const getTransactionData = async () => { // This gets transaction data from the database
  const currentUser = await Auth.currentAuthenticatedUser();
  try {
    // get id token
    const idToken = await getIdToken();

    const response = await axios.get(`${API_URL}/trans-dataanalysis`, {
      params:{pk: currentUser.username.toString()},
      headers: {
        Authorization: `Bearer ${idToken}`,
        //'x-api-key': 'your-api-key',  // Add if you require an API key
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};