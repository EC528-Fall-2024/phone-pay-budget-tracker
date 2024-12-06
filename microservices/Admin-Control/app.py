
'''
def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': "Hello from Admin Control!"
    }
'''


import boto3
import os
import json

def lambda_handler(event, context):
    try:
        aws_endpoint = os.getenv('AWS_ENDPOINT')
        table_name = os.getenv('TABLE_NAME')

        print(f"Connecting to DynamoDB at endpoint: {aws_endpoint}")

        dynamodb = boto3.resource('dynamodb', endpoint_url=aws_endpoint)
        table = dynamodb.Table(table_name)

        table.put_item(
            Item={
                'id': 'admin-123',
                'message': 'Admin Control Test'
            }
        )

        response = table.get_item(
            Key={
                'id': 'admin-123'
            }
        )

        if 'Item' not in response:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': 'Item not found in DynamoDB'
                })
            }

        return {
            'statusCode': 200,
            'body': json.dumps(response['Item'])
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

