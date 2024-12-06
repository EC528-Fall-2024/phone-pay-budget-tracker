import axios from "axios";
import { Auth } from "aws-amplify"; // Import Amplify Auth


axios.interceptors.request.use((config) => {
  console.log("Axios is about to send a request:", {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data,
    params: config.params,
  });
  return config;
});

/**
 * Fetches the Plaid link token from the backend Lambda function.
 *
 * @param {string} userId - Unique identifier for the user.
 * @returns {Promise<string>} - Returns the link token from Plaid.
 */
export const fetchLinkToken = async (userId) => {
  try {
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/create-link-token`,
      {
        userId,
      }
    );
    return response.data.link_token;
  } catch (error) {
    console.error("Error fetching link token:", error);
    throw new Error("Unable to fetch link token");
  }
};

/**
 * Exchanges the public token for an access token
 *
 * @param {string} publicToken - The public token received from Plaid Link.
 * @returns {Promise<object>} - Returns the transaction data from Plaid.
 */
export const onSuccess = async (publicToken, bank, id, accounts, email, profilePhoto) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    console.log(currentUser.username);
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/get-access-token`,
      {
        // Post because we are sending confidential info, we will still receive the transactions
        public_token: publicToken,
        pk: currentUser.username.toString(),
        bank: bank,
        id: id,
        accounts: accounts,
        profilePhoto: profilePhoto,
        email: email,
      }
    );
    // console.log(response.data.totalTransactions)
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Unable to fetch transactions");
  }
};

/**
 * fetches transactions from Plaid.
 *
 * @param {string} accessToken - The public token received from Plaid Link.
 * @returns {Promise<object>} - Returns the transaction data from Plaid.
 */
export const getTransactions = async (accessToken) => {
  // This gets transaction data from Plaid
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const response = await axios.post(
      `https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/plaid/get-transactions`,
      {
        // Post because we are sending confidential info, we will still receive the transactions
        accessToken: accessToken.accessToken,
        pk: currentUser.username.toString(),
      }
    );
    // console.log(response.data.totalTransactions)
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Unable to fetch transactions");
  }
};

// Example function to handle GET request

export const getProfileData = async () => {
  try {
    // Get the current authenticated user
    const currentUser = await Auth.currentAuthenticatedUser();

    // Extract the username or sub from the user details
    const { username } = currentUser;

    // Make the API call with the username (you can pass it as a query param or request body)
    const response = await axios.get(`https://g7t2wcleej.execute-api.us-east-2.amazonaws.com/Prod/user-profile`, {
      params: { pk: username }, // Pass the username as a query parameter (pk)
      headers: {
        //'x-api-key': 'your-api-key',  // Add if API Gateway requires an API key
        "Content-Type": "application/json",
      },
    });

    return response.data; // Return the fetched profile data
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

export const setProfileData = async (data) => {
  try {
    const response = await axios.post(`https://g7t2wcleej.execute-api.us-east-2.amazonaws.com/Prod/user-profile`, data, {
      headers: {
        //'x-api-key': 'your-api-key',  // Include if API Gateway requires an API key
        "Content-Type": "application/json",
      },
    });

    return response.data; // Return response data on success
  } catch (error) {
    console.error("Error posting profile data:", error);
    throw error; // Re-throw the error for further handling
  }
};

export const getTransactionData = async () => {
  // This gets transaction data from the database
  const currentUser = await Auth.currentAuthenticatedUser();
  try {
    const response = await axios.get(`https://cw0w4njfuj.execute-api.us-east-2.amazonaws.com/Prod/transactions/store`, {
      params: { pk: currentUser.username.toString() },
      headers: {
        //'x-api-key': 'your-api-key',  // Add if you require an API key
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
