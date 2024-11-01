require('dotenv').config({ path: '../../../../../PhonePayBudgetTracker/.env' });
const plaid = require('plaid');

// Initialize the Plaid client
const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox,  // Use sandbox environment for testing
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': "67059ac70f3934001bb637ab",
      'PLAID-SECRET': "6480180b111c6e48efe009f6d5d568",
    },
  },
});

const client = new plaid.PlaidApi(configuration);

// Lambda handler to create a link token
exports.lambda_handler = async (event) => {
  try {
    const body = JSON.parse(event.body);  // Parse the incoming request body
    const userId = body.userId;  // Extract userId from request

    // Create the link token configuration
    const linkTokenConfig = {
      user: { client_user_id: 'custom_brennan' },  // Use the userId received in the request
      client_name: 'Plaid Tutorial',  // Customize this based on your app
      language: 'en',
      products: ['transactions'],  // Add the products you want to use (auth, transactions, etc.)
      country_codes: ['US'],  // Country codes for where you want to use Plaid
      webhook: 'https://www.example.com/webhook',  // Optional: Add a webhook if needed
    };

    // Generate the link token using Plaid's API
    const tokenResponse = await client.linkTokenCreate(linkTokenConfig);
    
    // Send the link token back to the client
    return {
      statusCode: 200,
      body: JSON.stringify(tokenResponse.data),  // Return the link token data
    };
  } catch (error) {
    // Handle any errors that occur
    console.error('Error creating link token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),  // Send error details back
    };
  }
};
