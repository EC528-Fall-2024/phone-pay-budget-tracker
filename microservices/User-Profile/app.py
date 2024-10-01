def lambda_handler(event, context):
    # hard coded data for demo purposes and to connect to frontend
    user_data = {
        "1": {"name": "John Doe", "email": "john.doe@example.com"},
        "2": {"name": "Jane Smith", "email": "jane.smith@example.com"},
        "3": {"name": "Alice Johnson", "email": "alice.johnson@example.com"},
    }

    # get user_id from query string parameters 
    # (we should consider encoding this then decoding it here)
    user_id = event.get('queryStringParameters', {}).get('user_id')

    # needs to be changed to query database for user data based on user_id
    if user_id in user_data:
        user = user_data[user_id]
        return {
            'statusCode': 200,
            'body': f"User Name: {user['name']}, Email: {user['email']}"
        }

    # return 404 if user not found 
    # (we need to make sure to not diplay specific error on frontend for security reasons)
    return {
        'statusCode': 404,
        'body': 'User not found'
    }

