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
    TableName='tbl_user',
    Item={
        'id': 'xwill',
        'password': 'cart#123', # Make sure to hash
        'username': 'SomeName',
        'email': 'xwill@bu.edu',
        'account_type': 'standard_user',
        'last_login': 1727226744, # Unix timestamp
    }
)