const AWS = require('aws-sdk');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins (adjust as needed for security)
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed HTTP methods
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed headers
};

exports.lambda_handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        console.log("queryStringParameters:", event.queryStringParameters);
        console.log("body:", event.body);

        const pk = event.queryStringParameters?.pk || (event.body ? JSON.parse(event.body).pk : undefined);

        if (!pk) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Missing user id (pk)" }),
            };
        }

        const params = {
            TableName: tableName,
            Key: { pk: pk },
        };

        const response = await dynamodb.get(params).promise();

        if (response.Item) {
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                body: JSON.stringify(response.Item),
            };
        } else {
            return {
                statusCode: 404,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Profile not found' }),
            };
        }
    } catch (error) {
        console.error('Error occurred:', error);
        return {
            statusCode: error.message === 'Unauthorized' ? 401 : 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Unable to retrieve profile data.' }),
        };
    }
};

exports.lambda_handler_setProfile = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME;

    try {
        // Extract parameters from query string or body
        let pk, email, profilePhoto;
        if (event.queryStringParameters) {
            pk = event.queryStringParameters.pk;
            email = event.queryStringParameters.email;
            profilePhoto = event.queryStringParameters.profilePhoto;
        }

        if (event.body) {
            const body = JSON.parse(event.body);
            pk = pk || body.pk;
            email = email || body.email;
            profilePhoto = profilePhoto || body.profilePhoto;
        }

        // Ensure pk is provided
        if (!pk) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing pk' })
            };
        }

        // Fetch the existing item
        const getParams = {
            TableName: tableName,
            Key: { pk }
        };
        const existingItem = await dynamodb.get(getParams).promise();

        if (!existingItem.Item) {
            // Item not found, create a new one with whatever fields are provided
            const newItem = { pk };
            if (email !== undefined) newItem.email = email;
            if (profilePhoto !== undefined) newItem.profilePhoto = profilePhoto;

            const putParams = {
                TableName: tableName,
                Item: newItem
            };

            await dynamodb.put(putParams).promise();

            return {
                statusCode: 201,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Profile data created successfully', item: newItem })
            };

        } else {
            // Item exists, update only provided fields
            const updateExpressions = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {};

            if (email !== undefined) {
                updateExpressions.push("#email = :email");
                expressionAttributeNames["#email"] = "email";
                expressionAttributeValues[":email"] = email;
            }

            if (profilePhoto !== undefined) {
                updateExpressions.push("#profilePhoto = :profilePhoto");
                expressionAttributeNames["#profilePhoto"] = "profilePhoto";
                expressionAttributeValues[":profilePhoto"] = profilePhoto;
            }

            if (updateExpressions.length === 0) {
                // Nothing to update, return the existing item as is
                return {
                    statusCode: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'No changes provided, existing item unchanged', item: existingItem.Item })
                };
            }

            const updateParams = {
                TableName: tableName,
                Key: { pk },
                UpdateExpression: `SET ${updateExpressions.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };

            const updatedItem = await dynamodb.update(updateParams).promise();

            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Profile data updated successfully', item: updatedItem.Attributes })
            };
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        return {
            statusCode: error.message === 'Unauthorized' ? 401 : 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unable to update profile data.' })
        };
    }
};
