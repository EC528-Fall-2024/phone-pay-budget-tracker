import os
import unittest
from unittest.mock import patch, MagicMock
import json

os.environ['AWS_REGION'] = 'us-west-2'
os.environ['USER_POOL_ID'] = 'us-west-2_example'  
os.environ['EXPECTED_AUDIENCE'] = 'something'  
os.environ['TABLE_NAME'] = 'profileData'  
import app  

class TestAdminControlFunction(unittest.TestCase):

    @patch('app.validate_token')
    @patch('app.boto3.resource')
    def test_delete_user_success(self, mock_boto_resource, mock_validate_token):
        # Mock the validate_token function to return a decoded token
        mock_validate_token.return_value = {'sub': 'user123'}

        # Mock DynamoDB delete_item
        mock_table = MagicMock()
        mock_table.delete_item.return_value = {}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user123',
            'pathParameters': {'pk': 'user123'},
            'headers': {
                'Authorization': 'Bearer mocktoken123'
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(
            json.loads(response['body']),
            {'message': 'User with pk user123 deleted successfully'}
        )
        # Verify that validate_token was called with the correct token
        mock_validate_token.assert_called_with('mocktoken123')
        # Verify that delete_item was called with the correct key
        mock_table.delete_item.assert_called_with(Key={'pk': 'user123'})

    @patch('app.validate_token')
    @patch('app.boto3.resource')
    def test_delete_user_missing_pk(self, mock_boto_resource, mock_validate_token):
        # Mock the validate_token function to return a decoded token
        mock_validate_token.return_value = {'sub': 'user123'}

        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/',
            'pathParameters': {},  # Missing 'pk'
            'headers': {
                'Authorization': 'Bearer mocktoken123'
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(
            json.loads(response['body']),
            {'error': 'Invalid request: Missing pk'}
        )
        # Verify that validate_token was called with the correct token
        mock_validate_token.assert_called_with('mocktoken123')

    @patch('app.validate_token')
    def test_delete_user_missing_authorization(self, mock_validate_token):
        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user123',
            'pathParameters': {'pk': 'user123'},
            'headers': {
                # 'Authorization' header is missing
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 401)
        self.assertEqual(
            json.loads(response['body']),
            {'error': 'Unauthorized: Missing or invalid token'}
        )
        # Ensure that validate_token was never called
        mock_validate_token.assert_not_called()

    @patch('app.validate_token')
    @patch('app.boto3.resource')
    def test_delete_user_invalid_token(self, mock_boto_resource, mock_validate_token):
        # Mock the validate_token function to raise UnauthorizedException
        mock_validate_token.side_effect = app.UnauthorizedException("Unauthorized")

        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user123',
            'pathParameters': {'pk': 'user123'},
            'headers': {
                'Authorization': 'Bearer invalidtoken123'
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 401)
        self.assertEqual(
            json.loads(response['body']),
            {'error': 'Unauthorized'}
        )
        # Verify that validate_token was called with the correct token
        mock_validate_token.assert_called_with('invalidtoken123')

    @patch('app.validate_token')
    @patch('app.boto3.resource')
    def test_delete_user_dynamodb_exception(self, mock_boto_resource, mock_validate_token):
        # Mock the validate_token function to return a decoded token
        mock_validate_token.return_value = {'sub': 'user123'}

        # Mock DynamoDB delete_item to raise an exception
        mock_table = MagicMock()
        mock_table.delete_item.side_effect = Exception("DynamoDB error")
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user123',
            'pathParameters': {'pk': 'user123'},
            'headers': {
                'Authorization': 'Bearer mocktoken123'
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 500)
        self.assertEqual(
            json.loads(response['body']),
            {'error': 'DynamoDB error'}
        )
        # Verify that validate_token was called with the correct token
        mock_validate_token.assert_called_with('mocktoken123')
        # Verify that delete_item was called with the correct key
        mock_table.delete_item.assert_called_with(Key={'pk': 'user123'})

    @patch('app.validate_token')
    @patch('app.boto3.resource')
    def test_invalid_http_method(self, mock_boto_resource, mock_validate_token):
        # Mock the validate_token function to return a decoded token
        mock_validate_token.return_value = {'sub': 'user123'}

        event = {
            'httpMethod': 'POST',  # Invalid method for current app.py
            'path': '/admin-control/users/user123',
            'pathParameters': {'pk': 'user123'},
            'headers': {
                'Authorization': 'Bearer mocktoken123'
            }
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(
            json.loads(response['body']),
            {'error': 'Invalid request'}
        )
        # Verify that validate_token was called with the correct token
        mock_validate_token.assert_called_with('mocktoken123')

if __name__ == '__main__':
    unittest.main()