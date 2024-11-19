import unittest
from unittest.mock import patch, MagicMock
import app
import json

class TestAdminControlFunction(unittest.TestCase):

    @patch('app.boto3.resource')
    def test_list_all_users(self, mock_boto_resource):
        # Mock DynamoDB table scan
        mock_table = MagicMock()
        mock_table.scan.return_value = {'Items': [{'pk': 'user123', 'email': 'user@example.com'}]}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'GET',
            'path': '/admin-control/users',
            'pathParameters': None
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body']), [{'pk': 'user123', 'email': 'user@example.com'}])

    @patch('app.boto3.resource')
    def test_get_user_success(self, mock_boto_resource):
        # Mock DynamoDB get_item
        mock_table = MagicMock()
        mock_table.get_item.return_value = {'Item': {'pk': 'user123', 'email': 'user@example.com'}}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'GET',
            'path': '/admin-control/users/user123',
            'pathParameters': {'user_id': 'user123'}
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body']), {'pk': 'user123', 'email': 'user@example.com'})

    @patch('app.boto3.resource')
    def test_get_user_not_found(self, mock_boto_resource):
        # Mock DynamoDB get_item with no Item
        mock_table = MagicMock()
        mock_table.get_item.return_value = {}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'GET',
            'path': '/admin-control/users/user123',
            'pathParameters': {'user_id': 'user123'}
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 404)
        self.assertEqual(json.loads(response['body']), {'error': 'User not found'})

    @patch('app.boto3.resource')
    def test_add_user_success(self, mock_boto_resource):
        # Mock DynamoDB put_item
        mock_table = MagicMock()
        mock_table.put_item.return_value = {}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'POST',
            'path': '/admin-control/users',
            'body': json.dumps({'pk': 'user123', 'email': 'user@example.com'})
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body']), {'message': 'User added successfully'})

    @patch('app.boto3.resource')
    def test_delete_user_success(self, mock_boto_resource):
        # Mock DynamoDB delete_item
        mock_table = MagicMock()
        mock_table.delete_item.return_value = {}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto_resource.return_value = mock_dynamodb

        event = {
            'httpMethod': 'DELETE',
            'path': '/admin-control/users/user123',
            'pathParameters': {'user_id': 'user123'}
        }

        response = app.lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body']), {'message': 'User deleted successfully'})

if __name__ == '__main__':
    unittest.main()
