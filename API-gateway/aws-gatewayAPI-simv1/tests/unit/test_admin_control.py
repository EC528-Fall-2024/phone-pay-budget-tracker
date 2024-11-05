import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json
import importlib.util

# Compute the absolute path to app.py
current_dir = os.path.dirname(__file__)
app_path = os.path.abspath(os.path.join(current_dir, '../../../../microservices/Admin-Control/app.py'))
print(f"app.py path: {app_path}")

# Use importlib to import app.py from the file path
spec = importlib.util.spec_from_file_location("app", app_path)
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)

# Add 'app' to sys.modules so that 'patch' can find it
sys.modules['app'] = app

class TestAdminControl(unittest.TestCase):

    def setUp(self):
        # Set up environment variable
        os.environ['AWS_ENDPOINT'] = 'http://localhost:4566'

        # Patch boto3 resource
        self.patcher = patch('app.boto3.resource')
        self.mock_boto3_resource = self.patcher.start()

        # Mock DynamoDB resource and table
        self.mock_dynamodb_resource = MagicMock()
        self.mock_boto3_resource.return_value = self.mock_dynamodb_resource
        self.mock_table = MagicMock()
        self.mock_dynamodb_resource.Table.return_value = self.mock_table

    def tearDown(self):
        # Stop patching
        self.patcher.stop()

    # Test list_all_users function
    def test_list_all_users(self):
        # Mock scan method
        self.mock_table.scan.return_value = {
            'Items': [
                {'pk': 'user1', 'firstName': 'John', 'lastName': 'Doe'},
                {'pk': 'user2', 'firstName': 'Jane', 'lastName': 'Smith'}
            ]
        }

        response = app.list_all_users(self.mock_dynamodb_resource)

        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertEqual(len(body), 2)
        self.assertEqual(body[0]['pk'], 'user1')
        self.assertEqual(body[1]['firstName'], 'Jane')

    # Test get_user function with valid user_id
    def test_get_user_success(self):
        # Mock get_item method
        self.mock_table.get_item.return_value = {
            'Item': {'pk': 'user1', 'firstName': 'John', 'lastName': 'Doe'}
        }

        response = app.get_user(self.mock_dynamodb_resource, 'user1')

        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertEqual(body['pk'], 'user1')
        self.assertEqual(body['firstName'], 'John')

    # Test get_user function when user not found
    def test_get_user_not_found(self):
        # Mock get_item method to return empty
        self.mock_table.get_item.return_value = {}

        response = app.get_user(self.mock_dynamodb_resource, 'user3')

        self.assertEqual(response['statusCode'], 404)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'User not found')

    # Test get_user function with missing user_id
    def test_get_user_no_user_id(self):
        # Call the function with None
        response = app.get_user(self.mock_dynamodb_resource, None)

        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'User ID is required')

    # Test add_user function with valid data
    def test_add_user_success(self):
        # Mock put_item method
        self.mock_table.put_item.return_value = {}

        body = json.dumps({
            'pk': 'user4',
            'firstName': 'Alice',
            'lastName': 'Wonderland',
            'email': 'alice@example.com'
        })

        response = app.add_user(self.mock_dynamodb_resource, body)

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.put_item.assert_called_once()
        body = json.loads(response['body'])
        self.assertEqual(body['message'], 'User added successfully')

    # Test add_user function with missing pk
    def test_add_user_missing_pk(self):
        # Prepare data without pk
        body = json.dumps({
            'firstName': 'Alice',
            'lastName': 'Wonderland',
            'email': 'alice@example.com'
        })

        response = app.add_user(self.mock_dynamodb_resource, body)

        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'Missing user id (pk)')

    # Test add_user function with no body
    def test_add_user_no_body(self):
        # Call the function with None
        response = app.add_user(self.mock_dynamodb_resource, None)

        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'Missing request body')

    # Test delete_user function with valid user_id
    def test_delete_user_success(self):
        # Mock delete_item method
        self.mock_table.delete_item.return_value = {}

        response = app.delete_user(self.mock_dynamodb_resource, 'user4')

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.delete_item.assert_called_once_with(Key={'pk': 'user4'})
        body = json.loads(response['body'])
        self.assertEqual(body['message'], 'User deleted successfully')

    # Test delete_user function with missing user_id
    def test_delete_user_no_user_id(self):
        # Call the function with None
        response = app.delete_user(self.mock_dynamodb_resource, None)

        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'User ID is required')

    # Test lambda_handler for listing all users
    def test_lambda_handler_list_all_users(self):
        # Mock event
        event = {
            'httpMethod': 'GET',
            'path': '/admin-control/users',
            'pathParameters': None
        }

        # Mock scan method
        self.mock_table.scan.return_value = {
            'Items': [{'pk': 'user1'}]
        }

        response = app.lambda_handler(event, None)

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.scan.assert_called_once()

    # Test lambda_handler for getting a user
    def test_lambda_handler_get_user(self):
        # Mock event
        event = {
            'httpMethod': 'GET',
            'path': '/admin-control/users/user1',
            'pathParameters': {'user_id': 'user1'}
        }

        # Mock get_item method
        self.mock_table.get_item.return_value = {
            'Item': {'pk': 'user1', 'firstName': 'John'}
        }

        response = app.lambda_handler(event, None)

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.get_item.assert_called_once_with(Key={'pk': 'user1'})

    # Test lambda_handler for adding a user
    def test_lambda_handler_add_user(self):
        # Mock event
        event = {
            'httpMethod': 'POST',
            'path': '/admin-control/users',
            'body': json.dumps({'pk': 'user5', 'firstName': 'Bob'}),
            'pathParameters': None
        }

        # Mock put_item method
        self.mock_table.put_item.return_value = {}

        response = app.lambda_handler(event, None)

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.put_item.assert_called_once()
        body = json.loads(response['body'])
        self.assertEqual(body['message'], 'User added successfully')

    # Test lambda_handler for deleting a user
    def test_lambda_handler_delete_user(self):
        # Mock event
        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user5',
            'pathParameters': {'user_id': 'user5'}
        }

        # Mock delete_item method
        self.mock_table.delete_item.return_value = {}

        response = app.lambda_handler(event, None)

        self.assertEqual(response['statusCode'], 200)
        self.mock_table.delete_item.assert_called_once_with(Key={'pk': 'user5'})

    # Test lambda_handler with invalid request
    def test_lambda_handler_invalid_request(self):
        # Mock event with unsupported method and path
        event = {
            'httpMethod': 'PUT',
            'path': '/admin-control/unknown',
            'pathParameters': None
        }

        response = app.lambda_handler(event, None)

        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'Invalid request')

    # Test lambda_handler when an exception occurs
    def test_lambda_handler_exception(self):
        # Simulate exception in list_all_users
        with patch('app.list_all_users', side_effect=Exception('Test exception')):
            event = {
                'httpMethod': 'GET',
                'path': '/admin-control/users',
                'pathParameters': None
            }

            response = app.lambda_handler(event, None)

            self.assertEqual(response['statusCode'], 500)
            body = json.loads(response['body'])
            self.assertEqual(body['error'], 'Test exception')

if __name__ == '__main__':
    unittest.main()
