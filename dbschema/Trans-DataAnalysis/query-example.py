import boto3

def dynamo_to_python(dynamo_object: dict) -> dict:
    deserializer = TypeDeserializer()
    return {
        k: deserializer.deserialize(v) 
        for k, v in dynamo_object.items()
    }  
  
def python_to_dynamo(python_object: dict) -> dict:
    serializer = TypeSerializer()
    return {
        k: serializer.serialize(v)
        for k, v in python_object.items()
    }


dynamodb = boto3.client('dynamodb')

dynamodb.put_item(
    TableName='tbl_user_transaction',
    Item={
        'trans_type': 'payment',
        'trans_id': 'trans#123456',
        'amount': 11000, # $11.000, use integer for precision
        'user_id': 'xwill',
        'issue_date': 1727226744, # Unix timestamp
        'misc': {
            'purpose': 'food',
            'usernote': 'dunkin'
        }
    }
)