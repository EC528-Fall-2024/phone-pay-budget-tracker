// app.test.js

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

// Import Lambda handlers
const { lambda_handler, lambda_handler_setProfile } = require('./app');

describe('User Profile Microservice Tests', () => {
  // Set environment variables before all tests
  beforeAll(() => {
    process.env.TABLE_NAME = 'test-profileData';
    process.env.AWS_REGION = 'us-east-1';
    process.env.USER_POOL_ID = 'us-east-1_example';
    process.env.EXPECTED_AUDIENCE = 'something';
  });

  // Restore AWS mocks after each test
  afterEach(() => {
    AWSMock.restore();
  });

  // Test for successful retrieval of a user profile
  test('lambda_handler - success', async () => {
    const mockItem = { pk: 'user123', email: 'user@example.com' };

    // Mock DynamoDB get operation
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: 'user123' },
      });
      callback(null, { Item: mockItem });
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      queryStringParameters: {
        pk: 'user123',
      },
    };

    const response = await lambda_handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockItem);
  });

  // Test for profile not found
  test('lambda_handler - profile not found', async () => {
    // Mock DynamoDB get operation to return no item
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: 'user123' },
      });
      callback(null, {}); // No Item found
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      queryStringParameters: {
        pk: 'user123',
      },
    };

    const response = await lambda_handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ error: 'Profile not found' });
  });

  // Test for missing pk
  test('lambda_handler - missing pk in queryStringParameters and body', async () => {
    const event = {
      headers: {
        // No Authorization needed
      },
      queryStringParameters: {
        // pk missing
      },
      body: JSON.stringify({
        // pk missing
        email: 'user@example.com',
      }),
    };

    const response = await lambda_handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing user id (pk)' });
  });

  // Test for DynamoDB get error
  test('lambda_handler - DynamoDB get error', async () => {
    // Mock DynamoDB get operation to throw an error
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(new Error('DynamoDB Error'), null);
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      queryStringParameters: {
        pk: 'user123',
      },
    };

    const response = await lambda_handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Unable to retrieve profile data.' });
  });

  // Test for successful profile creation
  test('lambda_handler_setProfile - success (Create)', async () => {
    const pk = 'user123';
    const email = 'user@example.com';
    const profilePhoto = 'https://example.com/photo.jpg';

    // Mock DynamoDB get to return no item (creation path)
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: pk },
      });
      callback(null, {}); // No existing item
    });

    // Mock DynamoDB put operation
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Item: { pk, email, profilePhoto },
      });
      callback(null, {});
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        pk,
        email,
        profilePhoto,
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Profile data created successfully',
      item: { pk, email, profilePhoto },
    });
  });

  // Test for successful profile update
  test('lambda_handler_setProfile - success (Update)', async () => {
    const pk = 'user123';
    const email = 'new@example.com';
    const profilePhoto = 'https://example.com/newphoto.jpg';

    // Mock DynamoDB get to return existing item
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: pk },
      });
      callback(null, { Item: { pk, email: 'old@example.com' } });
    });

    // Mock DynamoDB update operation
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: pk },
        UpdateExpression: 'SET #email = :email, #profilePhoto = :profilePhoto',
        ExpressionAttributeNames: { '#email': 'email', '#profilePhoto': 'profilePhoto' },
        ExpressionAttributeValues: { ':email': email, ':profilePhoto': profilePhoto },
        ReturnValues: 'ALL_NEW',
      });
      callback(null, { Attributes: { pk, email, profilePhoto } });
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        pk,
        email,
        profilePhoto,
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Profile data updated successfully',
      item: { pk, email, profilePhoto },
    });
  });

  // Test for profile update with no fields provided
  test('lambda_handler_setProfile - update with no fields', async () => {
    const pk = 'user123';

    // Mock DynamoDB get to return existing item
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: pk },
      });
      callback(null, { Item: { pk, email: 'user@example.com', profilePhoto: 'https://example.com/photo.jpg' } });
    });

    // No update expressions since no fields provided, so no DynamoDB update call
    // So no need to mock 'update'

    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        pk,
        // No email or profilePhoto provided
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'No changes provided, existing item unchanged',
      item: { pk, email: 'user@example.com', profilePhoto: 'https://example.com/photo.jpg' },
    });
  });

  // Test for missing pk in setProfile
  test('lambda_handler_setProfile - missing pk', async () => {
    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing pk' });
  });

  // Test for DynamoDB put error
  test('lambda_handler_setProfile - DynamoDB put error', async () => {
    const pk = 'user123';
    const email = 'user@example.com';
    const profilePhoto = 'https://example.com/photo.jpg';

    // Mock DynamoDB get to return no item (creation path)
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, {}); // No existing item
    });

    // Mock DynamoDB put operation to throw an error
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Item: { pk, email, profilePhoto },
      });
      callback(new Error('DynamoDB Error'), null);
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        pk,
        email,
        profilePhoto,
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Unable to update profile data.' });
  });

  // Test for DynamoDB update error
  test('lambda_handler_setProfile - DynamoDB update error', async () => {
    const pk = 'user123';
    const email = 'new@example.com';
    const profilePhoto = 'https://example.com/newphoto.jpg';

    // Mock DynamoDB get to return existing item
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: { pk, email: 'old@example.com' } });
    });

    // Mock DynamoDB update operation to throw an error
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      expect(params).toEqual({
        TableName: 'test-profileData',
        Key: { pk: pk },
        UpdateExpression: 'SET #email = :email, #profilePhoto = :profilePhoto',
        ExpressionAttributeNames: { '#email': 'email', '#profilePhoto': 'profilePhoto' },
        ExpressionAttributeValues: { ':email': email, ':profilePhoto': profilePhoto },
        ReturnValues: 'ALL_NEW',
      });
      callback(new Error('DynamoDB Update Error'), null);
    });

    const event = {
      headers: {
        // No Authorization needed
      },
      body: JSON.stringify({
        pk,
        email,
        profilePhoto,
      }),
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Unable to update profile data.' });
  });
});
