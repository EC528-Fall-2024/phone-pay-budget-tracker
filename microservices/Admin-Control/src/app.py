import boto3
import os
import json
import jwt
import requests
from jwt.exceptions import InvalidTokenError

class BadRequestException(Exception):
    """Exception raised for client-side errors (HTTP 400)."""
    pass

class UnauthorizedException(Exception):
    """Exception raised for authentication errors (HTTP 401)."""
    pass

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
    except InvalidTokenError as e:
        print(f"Token validation failed: {e}")
        raise UnauthorizedException("Unauthorized")
    except Exception as e:
        print(f"Token validation failed: {e}")
        raise UnauthorizedException("Unauthorized")

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
            raise UnauthorizedException("Unauthorized: Missing or invalid token")
        token = auth_header.replace("Bearer ", "")
        decoded_token = validate_token(token)

        # Ensure the requester is authenticated
        user_sub = decoded_token.get('sub')
        if not user_sub:
            raise BadRequestException("Invalid token: Missing sub claim")

        # Handle DELETE request to delete a user by their `pk`
        if path.startswith('/admin-control/users/') and http_method == 'DELETE':
            pk = path_parameters.get('pk')  # Assuming pk is passed as a parameter in the path
            if not pk:
                raise BadRequestException("Invalid request: Missing pk")
            return delete_user(dynamodb, pk)

        # Handle invalid paths or methods
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Invalid request'})
        }

    except UnauthorizedException as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 401,  # Unauthorized
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }
    except BadRequestException as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 400,  # Bad Request
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,  # Internal Server Error
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def delete_user(dynamodb, pk):
    try:
        # Access the DynamoDB table
        profile_table = dynamodb.Table(os.environ['TABLE_NAME'])

        # Delete the user by their primary key (pk)
        response = profile_table.delete_item(
            Key={'pk': pk}
        )

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({'message': f'User with pk {pk} deleted successfully'})
        }
    except Exception as e:
        print(f"Error deleting user: {e}")
        raise  # Re-raise exception to be caught by the outer handler

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, GET, POST, OPTIONS'
    }



