const AWS = require('aws-sdk');


exports.lambda_handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        // Parse the pk (primary key) from the query string parameters or event body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const pk = event.queryStringParameters?.pk || requestBody.pk;


        if (!pk) {
            return {
                statusCode: 400,  // Bad request if no pk is provided
                body: JSON.stringify({ error: 'Missing user id (pk)' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        const params = {
            TableName: tableName,
            Key: { pk }  // Use the provided user id (pk) to fetch the data
        };

        const response = await dynamodb.get(params).promise();

        console.log('DynamoDB response:', response);

        if (response.Item) {
            // Return the found item
            return {
                statusCode: 200,
                body: JSON.stringify(response.Item),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } else {
            // Handle not found
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Profile not found' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        console.error('Error details:', error.stack);

        // Return an error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve profile', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

exports.lambda_handler_setProfile = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        // Parse the request body
        const requestBody = JSON.parse(event.body);

        const params = {
            TableName: tableName,
            Item: {
                pk: requestBody.pk,
                email: requestBody.email,
                profilePhoto: requestBody.profilePhoto,
            }
        };

        // Use put method to insert or update data in DynamoDB
        await dynamodb.put(params).promise();

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile data saved successfully' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error occurred:', error.message);

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save profile data', message: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
