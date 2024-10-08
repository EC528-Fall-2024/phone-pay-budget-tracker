import json

def lambda_handler(event, context):
    # Hardcoded transaction data
    transaction_data = [
        {
            'name': 'Transaction 1',
            'date': '2024-09-30',
            'amount': 150.50
        },
        {
            'name': 'Transaction 2',
            'date': '2024-09-28',
            'amount': 200.00
        },
        {
            'name': 'Transaction 3',
            'date': '2024-09-27',
            'amount': 75.25
        }
    ]

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow CORS from any origin
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(transaction_data)
    }

