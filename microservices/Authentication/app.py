import boto3
import os

def lambda_handler(event, context):
    aws_endpoint = os.getenv('AWS_ENDPOINT')
    table_name = os.getenv('TABLE_NAME')

    # Connect to DynamoDB using the LocalStack endpoint
    # (LocalStack is running in a Docker container locally)
    dynamodb = boto3.resource('dynamodb', endpoint_url=aws_endpoint)
    table = dynamodb.Table(table_name)

    # Add an item to the DynamoDB table and try to retrieve it
    table.put_item(
        Item={
            'id': 'auth-123',
            'username': 'testuser'
        }
    )

    response = table.get_item(
        Key={
            'id': 'auth-123'
        }
    )

    return {
        'statusCode': 200,
        'body': f"Authentication Microservice Response: {response['Item']}"
    }


