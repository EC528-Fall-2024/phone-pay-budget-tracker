const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

//process.env.TABLE_NAME = 'test-profileData';

const { lambda_handler, lambda_handler_setProfile } = require('./app');

describe('User Profile Microservice Tests', () => {
  beforeAll(() => {
    process.env.TABLE_NAME = 'test-profileData';
  });

  afterEach(() => {
    AWSMock.restore();
  });

  test('lambda_handler - success', async () => {
    const mockItem = { pk: 'user123', email: 'user@example.com' };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: mockItem });
    });

    const event = {
      queryStringParameters: { pk: 'user123' }
    };

    const response = await lambda_handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockItem);
  });

  test('lambda_handler - missing pk', async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, {});
    });

    const event = {};

    const response = await lambda_handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing user id (pk)' });
  });

  test('lambda_handler_setProfile - success', async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, {});
    });

    const event = {
      body: JSON.stringify({
        pk: 'user123',
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg'
      })
    };

    const response = await lambda_handler_setProfile(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'Profile data saved successfully' });
  });

  test('lambda_handler_setProfile - error', async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(new Error('DynamoDB Error'), null);
    });

    const event = {
      body: JSON.stringify({
        pk: 'user123',
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg'
      })
    };

    const response = await lambda_handler_setProfile(event);
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Failed to save profile data');
  });
});
