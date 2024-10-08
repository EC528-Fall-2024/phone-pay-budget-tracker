import axios from 'axios';
import { Auth } from 'aws-amplify';  // Import Amplify Auth



// Replace with your actual API Gateway URL and API keys if needed
const API_URL = 'http://127.0.0.1:3000'; 

// Example function to handle GET request

export const getProfileData = async () => {
  try {
    // Get the current authenticated user
    const currentUser = await Auth.currentAuthenticatedUser();
    
    // Extract the username or sub from the user details
    const { username } = currentUser;
    
    // Make the API call with the username (you can pass it as a query param or request body)
    const response = await axios.get(`${API_URL}/user-profile`, {
      params: { pk: username },  // Pass the username as a query parameter (pk)
      headers: {
        //'x-api-key': 'your-api-key',  // Add if API Gateway requires an API key
        'Content-Type': 'application/json',
      },
    });

    return response.data;  // Return the fetched profile data
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

export const setProfileData = async (data) => {
  try {    

    const response = await axios.post(`${API_URL}/user-profile`, data, {
      headers: {
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

export const getTransactionData = async () => {
  try {
    const response = await axios.get(`${API_URL}/trans-dataanalysis`, {
      headers: {
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



// Example function to handle POST request
export const postData = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/your-post-endpoint`, data, {
      headers: {
        'x-api-key': 'your-api-key',  // Add if you require an API key
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

// Example function to handle PUT request
export const updateData = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/your-put-endpoint/${id}`, data, {
      headers: {
        'x-api-key': 'your-api-key',  // Add if you require an API key
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

// Example function to handle DELETE request
export const deleteData = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/your-delete-endpoint/${id}`, {
      headers: {
        'x-api-key': 'your-api-key',  // Add if you require an API key
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};
