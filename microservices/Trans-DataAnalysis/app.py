import boto3
import os

def lambda_handler(event, context):
    aws_endpoint = os.getenv('AWS_ENDPOINT')
    table_name = os.getenv('TABLE_NAME')

    dynamodb = boto3.resource('dynamodb', endpoint_url=aws_endpoint)
    table = dynamodb.Table(table_name)

    # Example: Put an item into DynamoDB
    table.put_item(
        Item={
            'id': 'trans-123',
            'transaction_data': 'Sample Data'
        }
    )

    # Example: Get the item from DynamoDB
    response = table.get_item(
        Key={
            'id': 'trans-123'
        }
    )

    return {
        'statusCode': 200,
        'body': f"Transaction Data Analysis Response: {response['Item']}"
    }

