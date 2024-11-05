
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Lambda handler function to get a user's profile
exports.lambda_handler = async (event) => {
  const awsEndpoint = process.env.AWS_ENDPOINT;
  const tableName = process.env.TABLE_NAME;

  // Parse the pk (primary key) from the query string parameters or event body
  const pk = event.queryStringParameters?.pk || event.body?.pk;
  if (!pk) {
    return {
      statusCode: 400, // Bad request if no pk is provided
      body: JSON.stringify({ error: 'Missing user id (pk)' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const dynamoClient = new DynamoDBClient({
    endpoint: awsEndpoint,
    region: 'us-east-2',
  });

  const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

  const params = {
    TableName: tableName,
    Key: { pk },
  };

  try {
    const response = await dynamodb.send(new GetCommand(params));

    console.log('DynamoDB response:', response);

    if (response.Item) {
      // Return the found item
      return {
        statusCode: 200,
        body: JSON.stringify(response.Item),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } else {
      // Handle not found
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Profile not found' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  } catch (error) {
    console.error('Error occurred during query:', error.message);
    console.error('Error details:', error.stack);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve transactions', message: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

// Lambda handler function to set a user's profile
exports.lambda_handler_setProfile = async (event) => {
  const awsEndpoint = process.env.AWS_ENDPOINT;
  const tableName = process.env.TABLE_NAME;

  const dynamoClient = new DynamoDBClient({
    endpoint: awsEndpoint,
    region: 'us-east-2',
  });

  const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

  // Check if the body exists
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  let requestBody;
  try {
    // Parse the request body
    requestBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Validate required fields
  if (!requestBody.pk || !requestBody.firstName || !requestBody.lastName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields in profile data' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const params = {
    TableName: tableName,
    Item: {
      pk: requestBody.pk,
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      username: requestBody.username,
      email: requestBody.email,
      profilePhoto: requestBody.profilePhoto,
    },
  };

  try {
    // Use PutCommand to insert or update data in DynamoDB
    await dynamodb.send(new PutCommand(params));

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Profile data saved successfully' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error occurred:', error.message);

    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save profile data', message: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
