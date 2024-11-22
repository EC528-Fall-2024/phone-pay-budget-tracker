import axios from "axios";
import { Auth } from "aws-amplify"; // Import Amplify Auth

// Replace with your actual API Gateway URL and API keys if needed
const API_URL = "http://localhost:3000";

const API_BASE_URL = "http://localhost:3000";

/**
 * Fetches the Plaid link token from the backend Lambda function.
 *
 * @param {string} userId - Unique identifier for the user.
 * @returns {Promise<string>} - Returns the link token from Plaid.
 */
export const fetchLinkToken = async (userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/trans-dataanalysis/plaid/create_link_token`,
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
      `${API_BASE_URL}/trans-dataanalysis/plaid/get_access_token`,
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
      `${API_BASE_URL}/trans-dataanalysis/plaid/get_transactions`,
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
    const response = await axios.get(`${API_URL}/user-profile`, {
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
    const response = await axios.post(`${API_URL}/user-profile`, data, {
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
    const response = await axios.get(`${API_URL}/trans-dataanalysis`, {
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

// Example function to handle POST request
export const postData = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/your-post-endpoint`, data, {
      headers: {
        "x-api-key": "your-api-key", // Add if you require an API key
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

// Example function to handle PUT request
export const updateData = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/your-put-endpoint/${id}`,
      data,
      {
        headers: {
          "x-api-key": "your-api-key", // Add if you require an API key
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

// Example function to handle DELETE request
export const deleteData = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/your-delete-endpoint/${id}`,
      {
        headers: {
          "x-api-key": "your-api-key", // Add if you require an API key
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
