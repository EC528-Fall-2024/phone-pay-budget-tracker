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

response = dynamodb.update_item(
    TableName='tbl_user',
    Key={
        'id': 'xwill',
    },
    UpdateExpression="set account_type = :r",
    ExpressionAttributeValues={
        ':r': 'banned_user',
    },
    ReturnValues="UPDATED_NEW"
)