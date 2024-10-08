import boto3
import os

def lambda_handler(event, context):
    aws_endpoint = os.getenv('AWS_ENDPOINT')
    table_name = os.getenv('TABLE_NAME')

    dynamodb = boto3.resource('dynamodb', endpoint_url=aws_endpoint)
    table = dynamodb.Table(table_name)

    
    table.put_item(
        Item={
            'id': 'notif-123',
            'message': 'Notification Test Message'
        }
    )

    response = table.get_item(
        Key={
            'id': 'notif-123'
        }
    )

    return {
        'statusCode': 200,
        'body': f"Notifications Microservice Response: {response['Item']}"
    }


