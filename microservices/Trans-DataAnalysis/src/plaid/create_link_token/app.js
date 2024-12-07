const plaid = require('plaid');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
};

exports.lambda_handler = async (event) => {
    try {
        // Parse request body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const userId = requestBody.userId;

        if (!userId) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing userId' }),
            };
        }

        // Plaid client configuration
        const configuration = new plaid.Configuration({
            basePath: plaid.PlaidEnvironments.sandbox, 
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                    'PLAID-SECRET': process.env.PLAID_SECRET,
                },
            },
        });
        const client = new plaid.PlaidApi(configuration);

        const linkTokenCreateRequest = {
            user: {
                client_user_id: userId,
            },
            client_name: 'Plaid Tutorial',
            language: 'en',
            products: ['transactions'],
            country_codes: ['US'],
            webhook: 'https://www.example.com/webhook',
        };

        const linkTokenResponse = await client.linkTokenCreate(linkTokenCreateRequest);

        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify(linkTokenResponse.data),
        };
    } catch (error) {
        console.error('Error occurred:', error.message);
        const statusCode = error.message === 'Unauthorized' ? 401 : 500;
        return {
            statusCode: statusCode,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
