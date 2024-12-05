import boto3
import os
import json
import jwt
import requests
from jwt.exceptions import InvalidTokenError

# Cognito configuration
COGNITO_ISSUER = f"https://cognito-idp.{os.environ['AWS_REGION']}.amazonaws.com/{os.environ['USER_POOL_ID']}"
EXPECTED_AUDIENCE = os.environ['EXPECTED_AUDIENCE']

def validate_token(token):
    try:
        # Fetch JWKs
        jwks_url = f"{COGNITO_ISSUER}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()

        # Decode token header
        unverified_header = jwt.get_unverified_header(token)
        jwk = next((key for key in jwks['keys'] if key['kid'] == unverified_header['kid']), None)
        if not jwk:
            raise InvalidTokenError("JWK not found for token.")

        # Convert JWK to PEM and validate token
        pem = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
        decoded_token = jwt.decode(token, pem, issuer=COGNITO_ISSUER, audience=EXPECTED_AUDIENCE, algorithms=['RS256'])
        return decoded_token
    except Exception as e:
        print(f"Token validation failed: {e}")
        raise Exception("Unauthorized")

def lambda_handler(event, context):
    try:
        # Initialize DynamoDB resource
        dynamodb = boto3.resource('dynamodb')

        # Extract HTTP method and path
        http_method = event.get('httpMethod')
        path = event.get('path')
        path_parameters = event.get('pathParameters') or {}
        body = event.get('body')

        # Validate Authorization token
        auth_header = event['headers'].get('Authorization', '')
        if not auth_header or not auth_header.startswith("Bearer "):
            raise Exception("Unauthorized: Missing or invalid token")
        token = auth_header.replace("Bearer ", "")
        decoded_token = validate_token(token)

        # Ensure the requester is authenticated
        user_sub = decoded_token.get('sub')
        if not user_sub:
            raise Exception("Invalid token: Missing sub claim")

        # Handle DELETE request to delete a user by username
        if path.startswith('/admin-control/users/') and http_method == 'DELETE':
            username = path_parameters.get('user_id')  # user_id is passed as the username
            if not username:
                raise Exception("Invalid request: Missing username")
            return delete_user(dynamodb, username)

        # Handle invalid paths or methods
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Invalid request'})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def delete_user(dynamodb, username):
    try:
        # Access the DynamoDB table
        profile_table = dynamodb.Table(os.environ['TABLE_NAME'])

        # Query to find the user by username
        response = profile_table.scan(
            FilterExpression='username = :username',
            ExpressionAttributeValues={':username': username}
        )

        # Check if the user exists
        items = response.get('Items', [])
        if not items:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({'error': f'User {username} not found'})
            }

        # Use the `sub` (pk) to delete the user
        user_sub = items[0]['pk']  # Assume `pk` is the primary key stored as `sub`
        profile_table.delete_item(Key={'pk': user_sub})

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({'message': f'User {username} deleted successfully'})
        }
    except Exception as e:
        print(f"Error deleting user: {e}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
    }


# def list_all_users(dynamodb):
#     profile_table = dynamodb.Table('profileData')
#     response = profile_table.scan()
#     users = response.get('Items', [])
#     return {
#         'statusCode': 200,
#         'headers': {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#             'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#         },
#         'body': json.dumps(users)
#     }

# def get_user(dynamodb, user_id):
#     if not user_id:
#         return {
#             'statusCode': 400,
#             'headers': {
#                 'Access-Control-Allow-Origin': '*',
#                 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#                 'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#             },
#             'body': json.dumps({'error': 'User ID is required'})
#         }
#     profile_table = dynamodb.Table('profileData')
#     response = profile_table.get_item(Key={'pk': user_id})
#     user = response.get('Item')
#     if not user:
#         return {
#             'statusCode': 404,
#             'headers': {
#                 'Access-Control-Allow-Origin': '*',
#                 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#                 'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#             },
#             'body': json.dumps({'error': 'User not found'})
#         }
#     return {
#         'statusCode': 200,
#         'headers': {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#             'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#         },
#         'body': json.dumps(user)
#     }

# def add_user(dynamodb, body):
#     profile_table = dynamodb.Table('profileData')
#     if not body:
#         return {
#             'statusCode': 400,
#             'headers': {
#                 'Access-Control-Allow-Origin': '*',
#                 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#                 'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#             },
#             'body': json.dumps({'error': 'Missing request body'})
#         }
#     user_data = json.loads(body)
#     if 'pk' not in user_data:
#         return {
#             'statusCode': 400,
#             'headers': {
#                 'Access-Control-Allow-Origin': '*',
#                 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#                 'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#             },
#             'body': json.dumps({'error': 'Missing user id (pk)'})
#         }
#     profile_table.put_item(Item=user_data)
#     return {
#         'statusCode': 200,
#         'headers': {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#             'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#         },
#         'body': json.dumps({'message': 'User added successfully'})
#     }

# def delete_user(dynamodb, user_id):
#     if not user_id:
#         return {
#             'statusCode': 400,
#             'headers': {
#                 'Access-Control-Allow-Origin': '*',
#                 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#                 'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#             },
#             'body': json.dumps({'error': 'User ID is required'})
#         }
#     profile_table = dynamodb.Table('profileData')
#     profile_table.delete_item(Key={'pk': user_id})
#     return {
#         'statusCode': 200,
#         'headers': {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': 'Authorization, Content-Type',
#             'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
#         },
#         'body': json.dumps({'message': 'User deleted successfully'})
#     }


