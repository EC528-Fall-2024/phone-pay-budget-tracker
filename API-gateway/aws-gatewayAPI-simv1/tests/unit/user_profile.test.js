
process.env.AWS_ENDPOINT = 'http://localhost:4566'; // LocalStack endpoint
process.env.TABLE_NAME = 'profileData';

const path = require('path');


const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamodbSendMock = jest.fn();

// Spy on DynamoDBDocumentClient.from and mock its implementation
jest.spyOn(DynamoDBDocumentClient, 'from').mockImplementation(() => ({
  send: dynamodbSendMock,
}));

const appPath = path.resolve(__dirname, '../../../../microservices/User-Profile/app.js');
console.log(`app.js path: ${appPath}`);

const { lambda_handler, lambda_handler_setProfile } = require(appPath);

describe('User-Profile Microservice Tests', () => {
  beforeEach(() => {
    // Clear mocks
    dynamodbSendMock.mockReset();
  });

  afterAll(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });

  describe('lambda_handler (Get Profile)', () => {
    test('should return profile data when pk is provided and profile exists', async () => {
      const event = {
        queryStringParameters: { pk: 'user123' },
      };

      const mockResponse = {
        Item: {
          pk: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      };

      dynamodbSendMock.mockResolvedValueOnce(mockResponse);

      const result = await lambda_handler(event);

      expect(dynamodbSendMock).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockResponse.Item);
    });

    test('should return 400 when pk is missing', async () => {
      const event = {
        queryStringParameters: {},
      };

      const result = await lambda_handler(event);

      expect(dynamodbSendMock).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Missing user id (pk)' });
    });

    test('should return 404 when profile does not exist', async () => {
      const event = {
        queryStringParameters: { pk: 'nonexistent' },
      };

      const mockResponse = {}; // No Item

      dynamodbSendMock.mockResolvedValueOnce(mockResponse);

      const result = await lambda_handler(event);

      expect(dynamodbSendMock).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ error: 'Profile not found' });
    });

    test('should handle DynamoDB errors gracefully', async () => {
      const event = {
        queryStringParameters: { pk: 'user123' },
      };

      const mockError = new Error('DynamoDB error');

      dynamodbSendMock.mockRejectedValueOnce(mockError);

      const result = await lambda_handler(event);

      expect(dynamodbSendMock).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to retrieve transactions',
        message: 'DynamoDB error',
      });
    });
  });

  describe('lambda_handler_setProfile (Set Profile)', () => {
    test('should save profile data successfully', async () => {
      const event = {
        body: JSON.stringify({
          pk: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          profilePhoto: 'https://example.com/photo.jpg',
        }),
      };

      dynamodbSendMock.mockResolvedValueOnce({});

      const result = await lambda_handler_setProfile(event);

      expect(dynamodbSendMock).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ message: 'Profile data saved successfully' });
    });

    test('should handle missing request body', async () => {
      const event = {};

      const result = await lambda_handler_setProfile(event);

      expect(dynamodbSendMock).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Invalid request body' });
    });

    test('should handle invalid JSON in request body', async () => {
      const event = {
        body: 'Invalid JSON',
      };

      const result = await lambda_handler_setProfile(event);

      expect(dynamodbSendMock).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Invalid JSON in request body' });
    });

    test('should handle missing required fields', async () => {
      const event = {
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      const result = await lambda_handler_setProfile(event);

      expect(dynamodbSendMock).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Missing required fields in profile data' });
    });

    test('should handle DynamoDB errors gracefully', async () => {
      const event = {
        body: JSON.stringify({
          pk: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          profilePhoto: 'https://example.com/photo.jpg',
        }),
      };

      const mockError = new Error('DynamoDB error');

      dynamodbSendMock.mockRejectedValueOnce(mockError);

      const result = await lambda_handler_setProfile(event);

      expect(dynamodbSendMock).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to save profile data',
        message: 'DynamoDB error',
      });
    });
  });
});
