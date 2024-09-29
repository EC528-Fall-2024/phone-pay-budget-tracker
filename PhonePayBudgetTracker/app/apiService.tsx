import axios from 'axios';

// Replace with your actual API Gateway URL and API keys if needed
const API_URL = 'http://localhost:4000'; 

// Example function to handle GET request
export const getData = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/user2`, {
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
