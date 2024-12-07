jest.mock('axios');
jest.mock('jsonwebtoken');

const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const { lambda_handler, lambda_handler_setProfile } = require('./app');

describe('User Profile Microservice Tests', () => {
  beforeAll(() => {
    process.env.TABLE_NAME = 'test-profileData';
    process.env.AWS_REGION = 'us-east-1';
    process.env.USER_POOL_ID = 'us-east-1_example';
  });

  afterEach(() => {
    AWSMock.restore();
    jest.clearAllMocks();
  });

  test('lambda_handler - success', async () => {
    const mockItem = { pk: 'user123', email: 'user@example.com' };

    AWSMock.setSDKInstance(AWS);
    const dynamoGetMock = jest.fn((params, callback) => {
      callback(null, { Item: mockItem });
    });
    AWSMock.mock('DynamoDB.DocumentClient', 'get', dynamoGetMock);

    // Mock Cognito token validation
    const mockJwks = {
      keys: [
        {
          kid: 'test-kid',
          kty: 'RSA',
          n: 'test-n',
          e: 'AQAB',
        },
      ],
    };
    axios.get.mockResolvedValue({ data: mockJwks });
    jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
    jwt.verify.mockReturnValue({ sub: 'user123' });

    const event = {
      headers: {
        Authorization: 'Bearer valid-token',
      },
    };

    const response = await lambda_handler(event);

    // Verify DynamoDB get was called with correct parameters
    expect(dynamoGetMock).toHaveBeenCalledWith(
      {
        TableName: 'test-profileData',
        Key: { pk: 'user123' },
      },
      expect.any(Function)
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockItem);
  });

  test('lambda_handler - profile not found', async () => {
    AWSMock.setSDKInstance(AWS);
    const dynamoGetMock = jest.fn((params, callback) => {
      callback(null, {}); // Simulate no item found
    });
    AWSMock.mock('DynamoDB.DocumentClient', 'get', dynamoGetMock);

    // Mock Cognito token validation
    const mockJwks = {
      keys: [
        {
          kid: 'test-kid',
          kty: 'RSA',
          n: 'test-n',
          e: 'AQAB',
        },
      ],
    };
    axios.get.mockResolvedValue({ data: mockJwks });
    jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
    jwt.verify.mockReturnValue({ sub: 'user123' });

    const event = {
      headers: {
        Authorization: 'Bearer valid-token',
      },
    };

    const response = await lambda_handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ error: 'Profile not found' });
  });


  test('lambda_handler_setProfile - success', async () => {
    AWSMock.setSDKInstance(AWS);
    const dynamoPutMock = jest.fn((params, callback) => {
      callback(null, {});
    });
    AWSMock.mock('DynamoDB.DocumentClient', 'put', dynamoPutMock);

    // Mock Cognito token validation
    const mockJwks = {
      keys: [
        {
          kid: 'test-kid',
          kty: 'RSA',
          n: 'test-n',
          e: 'AQAB',
        },
      ],
    };
    axios.get.mockResolvedValue({ data: mockJwks });
    jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
    jwt.verify.mockReturnValue({ sub: 'user123' });

    const event = {
      body: JSON.stringify({
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
      headers: {
        Authorization: 'Bearer valid-token',
      },
    };

    const response = await lambda_handler_setProfile(event);

    // Verify DynamoDB put was called with correct parameters
    expect(dynamoPutMock).toHaveBeenCalledWith(
      {
        TableName: 'test-profileData',
        Item: {
          pk: 'user123',
          email: 'user@example.com',
          profilePhoto: 'https://example.com/photo.jpg',
        },
      },
      expect.any(Function)
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'Profile data saved successfully' });
  });

  test('lambda_handler_setProfile - DynamoDB error', async () => {
    AWSMock.setSDKInstance(AWS);
    const dynamoPutMock = jest.fn((params, callback) => {
      callback(new Error('DynamoDB Error'), null);
    });
    AWSMock.mock('DynamoDB.DocumentClient', 'put', dynamoPutMock);

    // Mock Cognito token validation
    const mockJwks = {
      keys: [
        {
          kid: 'test-kid',
          kty: 'RSA',
          n: 'test-n',
          e: 'AQAB',
        },
      ],
    };
    axios.get.mockResolvedValue({ data: mockJwks });
    jwt.decode.mockReturnValue({ header: { kid: 'test-kid' } });
    jwt.verify.mockReturnValue({ sub: 'user123' });

    const event = {
      body: JSON.stringify({
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
      headers: {
        Authorization: 'Bearer valid-token',
      },
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unable to update profile data.');
  });

  test('lambda_handler_setProfile - missing Authorization header', async () => {
    AWSMock.setSDKInstance(AWS);
    const dynamoPutMock = jest.fn();
    AWSMock.mock('DynamoDB.DocumentClient', 'put', dynamoPutMock);

    const event = {
      body: JSON.stringify({
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
      // No headers
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unable to update profile data.');

    expect(dynamoPutMock).not.toHaveBeenCalled();
  });

  test('lambda_handler_setProfile - invalid token', async () => {
    // Mock Cognito token validation to fail
    axios.get.mockResolvedValue({ data: { keys: [] } });
    jwt.decode.mockReturnValue(null);
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    AWSMock.setSDKInstance(AWS);
    const dynamoPutMock = jest.fn();
    AWSMock.mock('DynamoDB.DocumentClient', 'put', dynamoPutMock);

    const event = {
      body: JSON.stringify({
        email: 'user@example.com',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    };

    const response = await lambda_handler_setProfile(event);

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unable to update profile data.');

    expect(dynamoPutMock).not.toHaveBeenCalled();
  });
});
