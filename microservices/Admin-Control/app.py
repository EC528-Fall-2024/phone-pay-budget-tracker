import boto3
import os
import json

def lambda_handler(event, context):
    try:
        aws_endpoint = os.getenv('AWS_ENDPOINT')
        print(f"Connecting to DynamoDB at endpoint: {aws_endpoint}")

        dynamodb = boto3.resource('dynamodb', endpoint_url=aws_endpoint)

        http_method = event.get('httpMethod')
        path = event.get('path')
        path_parameters = event.get('pathParameters') or {}
        query_string_parameters = event.get('queryStringParameters') or {}
        body = event.get('body')

        if path == '/admin-control/users' and http_method == 'GET':
            # List all users
            return list_all_users(dynamodb)
        elif path.startswith('/admin-control/users/') and http_method == 'GET':
            # Get a specific user
            user_id = path_parameters.get('user_id')
            return get_user(dynamodb, user_id)
        elif path == '/admin-control/users' and http_method == 'POST':
            # Add a new user
            return add_user(dynamodb, body)
        elif path.startswith('/admin-control/users/') and http_method == 'DELETE':
            # Delete a user
            user_id = path_parameters.get('user_id')
            return delete_user(dynamodb, user_id)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid request'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def list_all_users(dynamodb):
    profile_table = dynamodb.Table('profileData')
    response = profile_table.scan()
    users = response.get('Items', [])
    return {
        'statusCode': 200,
        'body': json.dumps(users)
    }

def get_user(dynamodb, user_id):
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'User ID is required'})
        }
    profile_table = dynamodb.Table('profileData')
    response = profile_table.get_item(Key={'pk': user_id})
    user = response.get('Item')
    if not user:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'User not found'})
        }
    return {
        'statusCode': 200,
        'body': json.dumps(user)
    }

def add_user(dynamodb, body):
    profile_table = dynamodb.Table('profileData')
    if not body:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing request body'})
        }
    user_data = json.loads(body)
    if 'pk' not in user_data:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing user id (pk)'})
        }
    profile_table.put_item(Item=user_data)
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'User added successfully'})
    }

def delete_user(dynamodb, user_id):
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'User ID is required'})
        }
    profile_table = dynamodb.Table('profileData')
    profile_table.delete_item(Key={'pk': user_id})
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'User deleted successfully'})
    }
